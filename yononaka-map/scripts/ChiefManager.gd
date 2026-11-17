extends Node

signal stage_started()
signal dialogue_ended()

var current_stage: Dictionary = {}
var _active: bool = false

# ── 次の保留ステージを返す ────────────────────────
func get_pending_stage() -> Dictionary:
	if ChiefData.stages.is_empty():
		return {}

	# 初回まだ会っていない → intro を返す
	if not ProgressManager.is_initial_met():
		for s in ChiefData.stages:
			if s.get("trigger") == "initial":
				return s

	# カウントベースのステージ（昇順に最初の未消費を返す）
	var t := ProgressManager.total()
	for s in ChiefData.stages:
		var trigger = s.get("trigger")
		if trigger is int and t >= trigger:
			if not ProgressManager.is_chief_stage_consumed(s.get("id", "")):
				return s

	return {}

func has_pending_stage() -> bool:
	return not get_pending_stage().is_empty()

func start() -> void:
	current_stage = get_pending_stage()
	if current_stage.is_empty():
		return

	var sid: String = current_stage.get("id", "")
	if sid == "intro":
		ProgressManager.mark_initial_met()
	else:
		ProgressManager.mark_chief_stage_consumed(sid)

	_active = true
	stage_started.emit()

func finish() -> void:
	_active = false
	current_stage = {}
	dialogue_ended.emit()

func is_active() -> bool:
	return _active
