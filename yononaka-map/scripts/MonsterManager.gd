extends Node

signal state_changed(new_state: String)
signal dialogue_ended()

enum State { NONE, INTRO, ODAI }

var current_state: State = State.NONE
var current_data:  Dictionary = {}

func start(data: Dictionary) -> void:
	if current_state != State.NONE:
		return
	current_data = data
	_set_state(State.INTRO)

func advance() -> void:
	match current_state:
		State.INTRO:
			print("[Monster] 見た！押下 → complete_monster id='%s'" % current_data.get("id", ""))
			ProgressManager.complete_monster(current_data.get("id", ""))
			_set_state(State.ODAI)
		State.ODAI:
			_end()

func quit() -> void:
	print("[Monster] quit（途中離脱・未カウント）")
	_end()

func _set_state(s: State) -> void:
	current_state = s
	state_changed.emit(State.keys()[s])

func _end() -> void:
	current_state = State.NONE
	current_data  = {}
	dialogue_ended.emit()

func is_active() -> bool:
	return current_state != State.NONE
