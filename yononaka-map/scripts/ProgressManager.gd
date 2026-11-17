extends Node

signal progress_changed(total: int)

const SAVE_PATH := "user://progress.json"

var _completed_npcs:     Dictionary = {}
var _completed_monsters: Dictionary = {}
var _chief_stages_consumed: Dictionary = {}
var _initial_met: bool = false

func _ready() -> void:
	_load()

# ── 達成記録 ─────────────────────────────────────
func complete_npc(id: String) -> void:
	if _completed_npcs.has(id):
		print("[Progress] NPC '%s' は達成済みのためスキップ" % id)
		return
	_completed_npcs[id] = true
	print("[Progress] NPC '%s' 達成！ 合計=%d" % [id, total()])
	_save()
	progress_changed.emit(total())

func complete_monster(id: String) -> void:
	if _completed_monsters.has(id):
		print("[Progress] Monster '%s' は達成済みのためスキップ" % id)
		return
	_completed_monsters[id] = true
	print("[Progress] Monster '%s' 達成！ 合計=%d" % [id, total()])
	_save()
	progress_changed.emit(total())

func total() -> int:
	return _completed_npcs.size() + _completed_monsters.size()

# ── 村長フラグ ────────────────────────────────────
func mark_initial_met() -> void:
	_initial_met = true
	_save()

func is_initial_met() -> bool:
	return _initial_met

func mark_chief_stage_consumed(id: String) -> void:
	_chief_stages_consumed[id] = true
	_save()

func is_chief_stage_consumed(id: String) -> bool:
	return _chief_stages_consumed.get(id, false)

# ── 永続化 ────────────────────────────────────────
func _save() -> void:
	var data := {
		"completed_npcs":        _completed_npcs,
		"completed_monsters":    _completed_monsters,
		"chief_stages_consumed": _chief_stages_consumed,
		"initial_met":           _initial_met,
	}
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(data))
		file.close()

func _load() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return
	var json := JSON.new()
	if json.parse(file.get_as_text()) != OK:
		file.close()
		return
	var d: Dictionary = json.get_data()
	file.close()
	_completed_npcs        = d.get("completed_npcs",        {})
	_completed_monsters    = d.get("completed_monsters",    {})
	_chief_stages_consumed = d.get("chief_stages_consumed", {})
	_initial_met           = d.get("initial_met",           false)
	print("ProgressManager: NPC=%d モンスター=%d" % [_completed_npcs.size(), _completed_monsters.size()])
