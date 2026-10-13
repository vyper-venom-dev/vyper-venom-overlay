/*  VYPER-VENOM Twitch alerts for After Effects
    Makes three new alerts by copying the ones you already finished (so all your tweaks carry over)
    and changing the label:
      ALERT_SUB   copy of ALERT_SHARE  (blue)       label "NEW SUBSCRIBER"
      ALERT_BITS  copy of ALERT_FOLLOW (red)        label "BITS CHEER"
      ALERT_RAID  copy of ALERT_LIKE   (hex burst)  label "INCOMING RAID"
    The originals are not changed. Comps that already exist are skipped, so it's safe to run twice.
    Then it adds the three to the Render Queue.

    How to run: File > Scripts > Run Script File... and pick this file.
    Undo with Edit > Undo "VYPER-VENOM Twitch alerts".
*/

(function () {
    var JOBS = [
        { from: "ALERT_SHARE",  to: "ALERT_SUB",  label: "NEW SUBSCRIBER" },
        { from: "ALERT_FOLLOW", to: "ALERT_BITS", label: "BITS CHEER" },
        { from: "ALERT_LIKE",   to: "ALERT_RAID", label: "INCOMING RAID" }
    ];
    var made = [], skipped = [], notes = [];

    function allComps() {
        var list = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if (it instanceof CompItem) list.push(it);
        }
        return list;
    }
    // exact name wins; otherwise the highest " vN" copy the build script made
    function findLatest(comps, base) {
        var best = null, bestN = -1;
        var re = new RegExp("^" + base + "( v(\\d+))?$");
        for (var i = 0; i < comps.length; i++) {
            var m = comps[i].name.match(re);
            if (!m) continue;
            var n = m[2] ? parseInt(m[2], 10) : 0;
            if (n === 0) return comps[i];
            if (n > bestN) { best = comps[i]; bestN = n; }
        }
        return best;
    }
    function exists(comps, name) {
        for (var i = 0; i < comps.length; i++) if (comps[i].name === name) return true;
        return false;
    }
    function queue(comp) {
        var rq = app.project.renderQueue.items.add(comp);
        var om = rq.outputModule(1);
        var templates = ["High Quality with Alpha", "Lossless with Alpha"];
        for (var t = 0; t < templates.length; t++) { try { om.applyTemplate(templates[t]); return true; } catch (e) {} }
        notes.push(comp.name + ": set its Output Module to ProRes 4444, RGB + Alpha, Straight by hand.");
        return false;
    }

    if (!app.project) { alert("Open your VYPER-VENOM project first."); return; }
    app.beginUndoGroup("VYPER-VENOM Twitch alerts");
    try {
        for (var j = 0; j < JOBS.length; j++) {
            var job = JOBS[j];
            var comps = allComps();
            if (exists(comps, job.to)) { skipped.push(job.to + " (already exists)"); continue; }

            var outer = findLatest(comps, job.from);
            if (!outer) { skipped.push(job.to + " (no " + job.from + " comp found)"); continue; }

            // the inner comp is the precomp layer inside the outer comp
            var innerLayerIndex = 0, inner = null;
            for (var l = 1; l <= outer.numLayers; l++) {
                var src = outer.layer(l).source;
                if (src instanceof CompItem) { innerLayerIndex = l; inner = src; break; }
            }
            if (!inner) { skipped.push(job.to + " (" + outer.name + " has no inner comp)"); continue; }

            var newInner = inner.duplicate();
            newInner.name = job.to + "_inner";
            var newOuter = outer.duplicate();
            newOuter.name = job.to;
            newOuter.layer(innerLayerIndex).replaceSource(newInner, false);
            try { newInner.parentFolder = inner.parentFolder; newOuter.parentFolder = outer.parentFolder; } catch (eF) {}

            // new label text, keeping the font, size and animation
            var label = null;
            for (var k = 1; k <= newInner.numLayers; k++) if (newInner.layer(k).name === "Label") label = newInner.layer(k);
            if (label) {
                var tdProp = label.property("ADBE Text Properties").property("ADBE Text Document");
                var td = tdProp.value;
                td.text = job.label;
                tdProp.setValue(td);
            } else {
                notes.push(job.to + ": no layer called Label, so change its text to \"" + job.label + "\" by hand.");
            }

            queue(newOuter);
            made.push(job.to + "  (from " + outer.name + ")");
        }

        var msg = made.length ? "Made and added to the Render Queue:\n- " + made.join("\n- ") : "Nothing new was made.";
        if (skipped.length) msg += "\n\nSkipped:\n- " + skipped.join("\n- ");
        if (notes.length) msg += "\n\nThings to check:\n- " + notes.join("\n- ");
        if (made.length) msg += "\n\nRender, then convert to WebM in Shutter Encoder (VP9, Enable alpha channel).";
        alert(msg);
    } catch (err) {
        alert("Something went wrong on line " + err.line + ":\n" + err.toString() +
              "\n\nUse Edit > Undo \"VYPER-VENOM Twitch alerts\", then send Claude a screenshot of this message.");
    }
    app.endUndoGroup();
})();
