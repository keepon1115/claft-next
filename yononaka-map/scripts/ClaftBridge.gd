extends Node
## CLAFT(親ページ)との認証ブリッジ(11-0)。A・F・Bの基盤。
## - 親ページからの postMessage({type:'claft-auth', accessToken, userId}) を受け取り保持する
## - api(): PostgREST呼び出しヘルパー(失敗許容。オフライン・未ログインでもゲームは止めない)
## - notify_parent(): 親ページへのイベント通知(トースト表示用)
## token未受領 = ゲストモード。記録系はスキップし、探索は全て可能。
## 詳細仕様: docs/renovation/11-map-features.md

signal auth_changed

# Supabase接続情報。anon keyは公開前提の鍵(RLSで保護)なので埋め込み可(09-avatar-sync.md参照)
const SUPABASE_URL := "https://laqvpxecqvlufboquffe.supabase.co"
const SUPABASE_ANON_KEY := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcXZweGVjcXZsdWZib3F1ZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzYwNjgsImV4cCI6MjA2NDAxMjA2OH0.IRkg1miEpOGIFQMnno_P0hsMe1IgwCi2kl_kNcrmZTw"

var access_token: String = ""
var user_id: String = ""

func _ready() -> void:
	if not OS.has_feature("web"):
		return
	# 親ページからのメッセージはJS側でJSON文字列にしてキューに貯め、Godot側でポーリングして取り出す。
	# (JavaScriptObjectのプロパティ受け渡しより堅牢な文字列渡し)
	# origin検証: 同一オリジン以外からのtokenは受け取らない。
	JavaScriptBridge.eval("""
		(function () {
			if (window.__claftAuthQueue) return;
			window.__claftAuthQueue = [];
			window.addEventListener('message', function (e) {
				if (e.origin !== window.location.origin) return;
				if (!e.data || e.data.type !== 'claft-auth') return;
				window.__claftAuthQueue.push(JSON.stringify(e.data));
			});
			// Godot起動は親iframeのonLoadより遅いので、受信準備完了を親へ知らせて再送してもらう
			if (window.parent !== window) {
				window.parent.postMessage({ type: 'map-event', event: 'bridge-ready' }, window.location.origin);
			}
		})();
	""", true)
	var timer := Timer.new()
	timer.wait_time = 0.5
	timer.timeout.connect(_poll_messages)
	add_child(timer)
	timer.start()

func is_logged_in() -> bool:
	return access_token != "" and user_id != ""

func _poll_messages() -> void:
	while true:
		var raw: Variant = JavaScriptBridge.eval(
			"(window.__claftAuthQueue && window.__claftAuthQueue.shift()) || ''", true)
		if raw == null or str(raw) == "":
			return
		var data: Variant = JSON.parse_string(str(raw))
		if data is Dictionary and str(data.get("type", "")) == "claft-auth":
			var new_token := str(data.get("accessToken", ""))
			var new_user := str(data.get("userId", ""))
			if new_token != access_token or new_user != user_id:
				access_token = new_token
				user_id = new_user
				print("[ClaftBridge] auth更新 logged_in=%s" % str(is_logged_in()))
				auth_changed.emit()

## PostgREST呼び出し。await して {ok, status, data} を受け取る。
## 失敗しても {ok:false} を返すだけ(ゲームを止めない)。
## 例: await ClaftBridge.api("GET", "/member_avatars?select=user_id,sprite_id")
func api(method: String, path: String, body: Variant = null,
		extra_headers: PackedStringArray = PackedStringArray()) -> Dictionary:
	var http := HTTPRequest.new()
	http.timeout = 10.0
	add_child(http)
	var headers := PackedStringArray([
		"apikey: " + SUPABASE_ANON_KEY,
		"Content-Type: application/json",
	])
	if access_token != "":
		headers.append("Authorization: Bearer " + access_token)
	headers.append_array(extra_headers)
	var methods := {
		"GET": HTTPClient.METHOD_GET, "POST": HTTPClient.METHOD_POST,
		"PATCH": HTTPClient.METHOD_PATCH, "DELETE": HTTPClient.METHOD_DELETE,
	}
	var body_str := "" if body == null else JSON.stringify(body)
	var err := http.request(SUPABASE_URL + "/rest/v1" + path, headers,
		methods.get(method, HTTPClient.METHOD_GET), body_str)
	if err != OK:
		http.queue_free()
		push_warning("[ClaftBridge] request失敗 %s %s (err=%d)" % [method, path, err])
		return {"ok": false, "status": 0, "data": null}
	var res: Array = await http.request_completed
	http.queue_free()
	var status := int(res[1])
	var data: Variant = JSON.parse_string((res[3] as PackedByteArray).get_string_from_utf8())
	if status < 200 or status >= 300:
		push_warning("[ClaftBridge] APIエラー %s %s → %d" % [method, path, status])
	return {"ok": status >= 200 and status < 300, "status": status, "data": data}

## 親ページ(CLAFT)へイベント通知。親側でトースト表示に使う。
func notify_parent(event_name: String, payload: Dictionary = {}) -> void:
	if not OS.has_feature("web"):
		return
	var msg := {"type": "map-event", "event": event_name, "payload": payload}
	JavaScriptBridge.eval(
		"window.parent !== window && window.parent.postMessage(%s, window.location.origin)"
			% JSON.stringify(msg), true)

## 新規タブでURLを開く(11-E ラジオ塔などで使用)
func open_url(url: String) -> void:
	if OS.has_feature("web"):
		JavaScriptBridge.eval("window.open(%s, '_blank')" % JSON.stringify(url), true)
	else:
		OS.shell_open(url)
