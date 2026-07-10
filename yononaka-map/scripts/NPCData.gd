extends Node

var npcs: Array = []

func _ready() -> void:
	_load_npcs()

func _load_npcs() -> void:
	var file = FileAccess.open("res://data/npcs.json", FileAccess.READ)
	if file == null:
		push_error("NPCData: npcs.json を開けませんでした")
		return
	var json_text = file.get_as_text()
	file.close()

	var json = JSON.new()
	var err = json.parse(json_text)
	if err != OK:
		push_error("NPCData: JSON パースエラー: " + json.get_error_message())
		return

	npcs = json.get_data()
	print("NPCData: %d 人のNPCを読み込みました" % npcs.size())

func get_npc_by_id(id: String) -> Dictionary:
	for npc in npcs:
		if npc.get("id", "") == id:
			return npc
	push_warning("NPCData: id='%s' のNPCが見つかりません" % id)
	return {}
