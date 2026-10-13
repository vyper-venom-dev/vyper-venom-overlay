/*  VYPER-VENOM alert layout fix for After Effects
    Edits the alerts the build script already made, in place (your other tweaks are kept):
      - Label ("NEW FOLLOWER" etc.) moves right to X 270, so it no longer overlaps the badge
      - Tag, its matte, both slivers and the tag sweep move 30 px left, so the slivers aren't cut off
    Works on ALERT_FOLLOW_inner, ALERT_SHARE_inner and ALERT_LIKE_inner
    (and their "v2", "v3"... versions if you ran the build script more than once).
    Safe to run twice: comps that are already fixed are skipped.
    Then it adds ALERT_FOLLOW, ALERT_SHARE and ALERT_LIKE to the Render Queue.

    How to run: File > Scripts > Run Script File... and pick this file.
    Undo with Edit > Undo "VYPER-VENOM alert fix".
*/

(function () {
    var SHIFT = -30;
    var LABEL_X = 270;
    var MOVE = { "Tag": 1, "Tag (matte)": 1, "Sliver 1": 1, "Sliver 2": 1, "Tag Sweep": 1 };
    var fixed = [], skipped = [], queued = [];

    function isInner(name) { return /^ALERT_(FOLLOW|SHARE|LIKE)_inner( v\d+)?$/.test(name); }
    function outerName(inner) { return inner.replace("_inner", ""); }

    function shiftPosition(prop, dx) {
        if (prop.numKeys > 0) {
            for (var k = 1; k <= prop.numKeys; k++) {
                var v = prop.keyValue(k);
                prop.setValueAtKey(k, [v[0] + dx, v[1]]);
            }
        } else {
            var c = prop.value;
            prop.setValue([c[0] + dx, c[1]]);
        }
    }

    if (!app.project) { alert("Open your VYPER-VENOM project first."); return; }
    app.beginUndoGroup("VYPER-VENOM alert fix");
    try {
        var comps = {};
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if (it instanceof CompItem) comps[it.name] = it;
        }
        for (var name in comps) {
            if (!isInner(name)) continue;
            var comp = comps[name];
            var label = null;
            for (var l = 1; l <= comp.numLayers; l++) if (comp.layer(l).name === "Label") label = comp.layer(l);
            if (!label) { skipped.push(name + " (no Label layer)"); continue; }

            var lp = label.property("ADBE Transform Group").property("ADBE Position");
            var lv = lp.numKeys > 0 ? lp.keyValue(1) : lp.value;
            if (Math.abs(lv[0] - LABEL_X) < 0.5) { skipped.push(name + " (already fixed)"); continue; }

            if (lp.numKeys > 0) { for (var k = 1; k <= lp.numKeys; k++) { var kv = lp.keyValue(k); lp.setValueAtKey(k, [LABEL_X, kv[1]]); } }
            else lp.setValue([LABEL_X, lv[1]]);

            for (var j = 1; j <= comp.numLayers; j++) {
                var layer = comp.layer(j);
                if (MOVE[layer.name]) shiftPosition(layer.property("ADBE Transform Group").property("ADBE Position"), SHIFT);
            }
            fixed.push(name);

            var outer = comps[outerName(name)];
            if (outer) {
                var rq = app.project.renderQueue.items.add(outer);
                var om = rq.outputModule(1);
                var ok = false;
                var templates = ["High Quality with Alpha", "Lossless with Alpha"];
                for (var t = 0; t < templates.length && !ok; t++) { try { om.applyTemplate(templates[t]); ok = true; } catch (e) {} }
                queued.push(outer.name + (ok ? "" : " (set Output Module to ProRes 4444 + RGB+Alpha by hand)"));
            }
        }

        var msg = "";
        msg += fixed.length ? "Fixed:\n- " + fixed.join("\n- ") : "Nothing needed fixing.";
        if (skipped.length) msg += "\n\nSkipped:\n- " + skipped.join("\n- ");
        if (queued.length) msg += "\n\nAdded to the Render Queue:\n- " + queued.join("\n- ") +
            "\n\nRender, then convert to WebM in Shutter Encoder (VP9, Enable alpha channel).";
        if (!fixed.length && !skipped.length) msg = "No ALERT_..._inner comps found. Run VYPER-VENOM_Build.jsx first.";
        alert(msg);
    } catch (err) {
        alert("Something went wrong on line " + err.line + ":\n" + err.toString() +
              "\n\nUse Edit > Undo \"VYPER-VENOM alert fix\", then send Claude a screenshot of this message.");
    }
    app.endUndoGroup();
})();
