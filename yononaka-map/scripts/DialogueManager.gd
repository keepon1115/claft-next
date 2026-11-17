extends Node

signal state_changed(new_state: String)
signal dialogue_ended()

enum State { NONE, APPROACH, ODAI, INPUT, ECHO, REPLY, REVEAL }

var current_state: State = State.NONE
var current_npc_data: Dictionary = {}
var player_answer: String = ""
var _reached_reveal: bool = false

func start_dialogue(npc_data: Dictionary) -> void:
	if current_state != State.NONE:
		return
	current_npc_data = npc_data
	player_answer = ""
	_set_state(State.APPROACH)

func _set_state(new_state: State) -> void:
	current_state = new_state
	if new_state == State.REVEAL:
		_reached_reveal = true
		print("[Dialogue] REVEAL 到達 npc='%s'" % current_npc_data.get("id", ""))
	state_changed.emit(State.keys()[new_state])

func advance() -> void:
	match current_state:
		State.APPROACH:
			_set_state(State.ODAI)
		State.ODAI:
			_set_state(State.INPUT)
		State.ECHO:
			_set_state(State.REPLY)
		State.REPLY:
			_set_state(State.REVEAL)
		State.REVEAL:
			_end_dialogue()

func submit_answer(answer: String) -> void:
	if current_state != State.INPUT:
		return
	player_answer = answer.strip_edges()
	_set_state(State.ECHO)

func get_aizuchi() -> String:
	var list: Array = current_npc_data.get("aizuchi", [])
	if list.is_empty():
		return ""
	return list[randi() % list.size()]

func is_active() -> bool:
	return current_state != State.NONE

func quit_dialogue() -> void:
	print("[Dialogue] quit（途中離脱）_reached_reveal=%s" % str(_reached_reveal))
	_reached_reveal = false   # 達成カウントしない
	_end_dialogue()

func _end_dialogue() -> void:
	print("[Dialogue] _end_dialogue() _reached_reveal=%s" % str(_reached_reveal))
	if _reached_reveal:
		ProgressManager.complete_npc(current_npc_data.get("id", ""))
	_reached_reveal = false
	current_state = State.NONE
	current_npc_data = {}
	player_answer = ""
	dialogue_ended.emit()
