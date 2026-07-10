extends Node

var monsters: Array = []

func _ready() -> void:
	var file = FileAccess.open("res://data/monsters.json", FileAccess.READ)
	if file == null:
		push_error("MonsterData: monsters.json を開けませんでした")
		return
	var json = JSON.new()
	if json.parse(file.get_as_text()) != OK:
		push_error("MonsterData: JSON パースエラー: " + json.get_error_message())
		return
	monsters = json.get_data()
	print("MonsterData: %d 体読み込みました" % monsters.size())
	file.close()

func get_by_id(id: String) -> Dictionary:
	for m in monsters:
		if m.get("id", "") == id:
			return m
	push_warning("MonsterData: id='%s' が見つかりません" % id)
	return {}
