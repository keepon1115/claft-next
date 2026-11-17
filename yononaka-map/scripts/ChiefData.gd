extends Node

var stages: Array = []

func _ready() -> void:
	var file := FileAccess.open("res://data/villagechief.json", FileAccess.READ)
	if file == null:
		push_error("ChiefData: villagechief.json を開けませんでした")
		return
	var json := JSON.new()
	if json.parse(file.get_as_text()) != OK:
		push_error("ChiefData: パースエラー: " + json.get_error_message())
		return
	stages = json.get_data().get("stages", [])
	file.close()
	print("ChiefData: %d 段階読み込み" % stages.size())
