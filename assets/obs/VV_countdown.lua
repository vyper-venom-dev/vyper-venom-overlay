-- VYPER-VENOM countdown for OBS
-- Same as OBS's own countdown.lua, but shows MM:SS (05:00) instead of HH:MM:SS (00:05:00),
-- so it matches the Starting Soon design.
-- Tools > Scripts > + > pick this file. Remove countdown.lua from the list if it's there.

obs = obslua

source_name   = ""
total_seconds = 0
cur_seconds   = 0
last_text     = ""
stop_text     = ""
activated     = false

function set_time_text()
	local minutes = math.floor(cur_seconds / 60)
	local seconds = math.floor(cur_seconds % 60)
	local text = string.format("%02d:%02d", minutes, seconds)
	if cur_seconds < 1 and stop_text ~= "" then
		text = stop_text
	end
	if text ~= last_text then
		local source = obs.obs_get_source_by_name(source_name)
		if source ~= nil then
			local settings = obs.obs_data_create()
			obs.obs_data_set_string(settings, "text", text)
			obs.obs_source_update(source, settings)
			obs.obs_data_release(settings)
			obs.obs_source_release(source)
		end
	end
	last_text = text
end

function timer_callback()
	cur_seconds = cur_seconds - 1
	if cur_seconds < 0 then
		obs.remove_current_callback()
		cur_seconds = 0
	end
	set_time_text()
end

function activate(activating)
	if activated == activating then
		return
	end
	activated = activating
	if activating then
		cur_seconds = total_seconds
		set_time_text()
		obs.timer_add(timer_callback, 1000)
	else
		obs.timer_remove(timer_callback)
	end
end

-- start when the text source appears on screen (either canvas), stop when it's hidden
function activate_signal(cd, activating)
	local source = obs.calldata_source(cd, "source")
	if source ~= nil then
		local name = obs.obs_source_get_name(source)
		if name == source_name then
			activate(activating)
		end
	end
end

function source_activated(cd)
	activate_signal(cd, true)
end

function source_deactivated(cd)
	activate_signal(cd, false)
end

function reset()
	activate(false)
	local source = obs.obs_get_source_by_name(source_name)
	if source ~= nil then
		local active = obs.obs_source_active(source)
		obs.obs_source_release(source)
		activate(active)
	end
end

function reset_button_clicked(props, p)
	reset()
	return false
end

function script_description()
	return "VYPER-VENOM countdown: shows MM:SS in a text source while it's on screen, then the final text."
end

function script_properties()
	local props = obs.obs_properties_create()
	obs.obs_properties_add_int(props, "duration", "Duration (minutes)", 1, 600, 1)

	local p = obs.obs_properties_add_list(props, "source", "Text Source",
		obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
	local sources = obs.obs_enum_sources()
	if sources ~= nil then
		for _, source in ipairs(sources) do
			local source_id = obs.obs_source_get_unversioned_id(source)
			if source_id == "text_gdiplus" or source_id == "text_ft2_source" then
				local name = obs.obs_source_get_name(source)
				obs.obs_property_list_add_string(p, name, name)
			end
		end
	end
	obs.source_list_release(sources)

	obs.obs_properties_add_text(props, "stop_text", "Final Text", obs.OBS_TEXT_DEFAULT)
	obs.obs_properties_add_button(props, "reset_button", "Reset Timer", reset_button_clicked)
	return props
end

function script_defaults(settings)
	obs.obs_data_set_default_int(settings, "duration", 5)
	obs.obs_data_set_default_string(settings, "source", "VV Countdown")
	obs.obs_data_set_default_string(settings, "stop_text", "LIVE")
end

function script_update(settings)
	activate(false)
	total_seconds = obs.obs_data_get_int(settings, "duration") * 60
	source_name   = obs.obs_data_get_string(settings, "source")
	stop_text     = obs.obs_data_get_string(settings, "stop_text")
	last_text     = ""
	reset()
end

function script_load(settings)
	local sh = obs.obs_get_signal_handler()
	obs.signal_handler_connect(sh, "source_activate", source_activated)
	obs.signal_handler_connect(sh, "source_deactivate", source_deactivated)
end
