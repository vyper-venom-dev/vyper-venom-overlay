/*  VYPER-VENOM build script for After Effects
    Builds the remaining assets as NEW comps (nothing you made is changed):
      - BG_LOOP_TW   1920x1080, 10 s seamless background loop
      - BG_LOOP_TT   1080x1920, 10 s seamless background loop
      - ALERT_FOLLOW 1080x400,  4 s  (red tag)
      - ALERT_SHARE  1080x400,  4 s  (royal blue tag)
      - ALERT_LIKE   1080x300,  4 s  (red tag + hex burst)
    It uses your existing RING comp for the badge in the alerts.
    If the WAV files from the same zip sit next to this script, they are added to the alerts.
    Finally it adds everything to the Render Queue.

    How to run: File > Scripts > Run Script File... and pick this file.
    Undo everything in one go with Edit > Undo "VYPER-VENOM build".
*/

(function () {
    var FPS = 60;
    var C = {
        black:  hex("0A0A0D"),
        gun:    hex("16141C"),
        red:    hex("E3132B"),
        blood:  hex("6E0A14"),
        blue:   hex("2E55FF"),
        bone:   hex("F1EDF4"),
        white:  [1, 1, 1]
    };
    var LABEL_FONT = "ChakraPetch-SemiBold";
    var notes = [];

    function hex(h) {
        return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
    }
    function f(frames) { return frames / FPS; }

    function findComp(name) {
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if (it instanceof CompItem && it.name === name) return it;
        }
        return null;
    }
    function uniqueName(name) {
        if (!findComp(name)) return name;
        var n = 2;
        while (findComp(name + " v" + n)) n++;
        notes.push(name + " already existed, so the new one is called " + name + " v" + n + ".");
        return name + " v" + n;
    }
    function newComp(name, w, h, dur, folder) {
        var c = app.project.items.addComp(uniqueName(name), w, h, 1, dur, FPS);
        c.bgColor = C.black;
        c.parentFolder = folder;
        return c;
    }

    // Easy Ease (F9) on every key of a property
    function ease(prop, influence) {
        influence = influence || 50;
        var dims = 1;
        if (prop.propertyValueType === PropertyValueType.TwoD) dims = 2;
        if (prop.propertyValueType === PropertyValueType.ThreeD) dims = 3;
        var e = [];
        for (var d = 0; d < dims; d++) e.push(new KeyframeEase(0, influence));
        for (var k = 1; k <= prop.numKeys; k++) {
            try { prop.setTemporalEaseAtKey(k, e, e); } catch (err) {}
        }
    }
    function keys(prop, list) {             // list = [[frame, value], ...]
        for (var i = 0; i < list.length; i++) prop.setValueAtTime(f(list[i][0]), list[i][1]);
    }
    function linearKeys(prop) {
        for (var k = 1; k <= prop.numKeys; k++) {
            prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        }
    }

    // ---- shape helpers -------------------------------------------------------
    function shapeLayer(comp, name) {
        var l = comp.layers.addShape();
        l.name = name;
        return l;
    }
    function addGroup(layer, name) {
        var g = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        g.name = name;
        return g.property("ADBE Vectors Group");
    }
    function addFill(contents, rgb) {
        var fl = contents.addProperty("ADBE Vector Graphic - Fill");
        fl.property("ADBE Vector Fill Color").setValue(rgb);
        return fl;
    }
    function addRect(contents, w, h, pos) {
        var r = contents.addProperty("ADBE Vector Shape - Rect");
        r.property("ADBE Vector Rect Size").setValue([w, h]);
        if (pos) r.property("ADBE Vector Rect Position").setValue(pos);
        return r;
    }
    function addPath(contents, pts) {
        var p = contents.addProperty("ADBE Vector Shape - Group");
        var s = new Shape();
        s.vertices = pts;
        s.closed = true;
        p.property("ADBE Vector Shape").setValue(s);
        return p;
    }
    function addRepeater(contents, copies, offset, rotation) {
        var r = contents.addProperty("ADBE Vector Filter - Repeater");
        r.property("ADBE Vector Repeater Copies").setValue(copies);
        var t = r.property("ADBE Vector Repeater Transform");
        t.property("ADBE Vector Repeater Position").setValue(offset || [0, 0]);
        if (rotation) t.property("ADBE Vector Repeater Rotation").setValue(rotation);
        return r;
    }
    function polygon(cx, cy, r, sides) {
        var pts = [];
        for (var i = 0; i < sides; i++) {
            var a = Math.PI * 2 * i / sides - Math.PI / 2;
            pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        }
        return pts;
    }

    function glowLayer(comp, name, rgb, centre, radius, phase) {
        // soft coloured light: solid + radial Gradient Ramp, added on top of the dark base
        var s = comp.layers.addSolid(C.black, name, comp.width, comp.height, 1, comp.duration);
        var ramp = s.property("ADBE Effect Parade").addProperty("ADBE Ramp");
        ramp.property("ADBE Ramp-0001").setValue(centre);
        ramp.property("ADBE Ramp-0002").setValue(rgb);
        ramp.property("ADBE Ramp-0003").setValue([centre[0] + radius, centre[1]]);
        ramp.property("ADBE Ramp-0004").setValue(C.black);
        ramp.property("ADBE Ramp-0005").setValue(2);           // radial
        s.blendingMode = BlendingMode.ADD;
        // pulses every 5 s: two full cycles per 10 s loop, so the loop is seamless
        s.property("ADBE Transform Group").property("ADBE Opacity").expression =
            "28 + 12 * Math.sin(time * 2 * Math.PI / 5 + " + phase + ")";
        return s;
    }

    // ---- background loop -----------------------------------------------------
    function buildLoop(name, w, h, folder) {
        var comp = newComp(name, w, h, 10, folder);

        comp.layers.addSolid(C.black, "Base", w, h, 1, 10);

        // two soft glows: venom red bottom-left, royal blue top-right
        glowLayer(comp, "Glow Red", C.red, [0, h], Math.max(w, h) * 0.75, 0);
        glowLayer(comp, "Glow Blue", C.blue, [w, 0], Math.max(w, h) * 0.6, "Math.PI");

        // grid: 48 px cells, drifts 96 px right over 10 s (exactly two cells = seamless)
        var grid = shapeLayer(comp, "Grid");
        var vert = addGroup(grid, "Vertical lines");
        addRect(vert, 2, h + 400, [-w / 2 - 144, 0]);
        addFill(vert, C.bone);
        addRepeater(vert, Math.ceil((w + 384) / 48) + 1, [48, 0]);
        var horz = addGroup(grid, "Horizontal lines");
        addRect(horz, w + 600, 2, [0, -h / 2 - 96]);
        addFill(horz, C.bone);
        addRepeater(horz, Math.ceil((h + 192) / 48) + 1, [0, 48]);
        var gt = grid.property("ADBE Transform Group");
        gt.property("ADBE Opacity").setValue(5);
        var gp = gt.property("ADBE Position");
        gp.setValueAtTime(0, [w / 2, h / 2]);
        gp.setValueAtTime(10, [w / 2 + 96, h / 2]);
        linearKeys(gp);

        // light sweep: crosses once every 5 s (two passes per loop)
        var sw = comp.layers.addSolid(C.white, "Light Sweep", 260, Math.round(Math.max(w, h) * 2.2), 1, 10);
        var blur = sw.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
        blur.property("ADBE Gaussian Blur 2-0001").setValue(120);
        sw.blendingMode = BlendingMode.ADD;
        var st = sw.property("ADBE Transform Group");
        st.property("ADBE Rotate Z").setValue(20);
        st.property("ADBE Opacity").setValue(7);
        st.property("ADBE Position").expression =
            "var p = Math.min((time % 5) / 2.5, 1);\n" +
            "[-600 + p * (thisComp.width + 1200), thisComp.height / 2]";

        // thin brand lines at the edges, slowly breathing
        var edges = shapeLayer(comp, "Edge Accents");
        var eg = addGroup(edges, "Left blue");
        addRect(eg, 4, Math.round(h * 0.18), [-w / 2 + 32, 0]);
        addFill(eg, C.blue);
        var eg2 = addGroup(edges, "Right red");
        addRect(eg2, 4, Math.round(h * 0.18), [w / 2 - 32, 0]);
        addFill(eg2, C.red);
        edges.property("ADBE Transform Group").property("ADBE Opacity").expression =
            "70 + 30 * Math.sin(time * 2 * Math.PI / 2.5)";

        return comp;
    }

    // ---- alerts ---------------------------------------------------------------
    function importSound(fileName) {
        try {
            var here = File($.fileName).parent;
            var file = new File(here.fsName + "/" + fileName);
            if (!file.exists) return null;
            var item = app.project.importFile(new ImportOptions(file));
            return item;
        } catch (e) { return null; }
    }

    function buildAlert(opt, folder, ring) {
        var W = 1080, H = opt.h, Y = opt.y;
        var inner = newComp(opt.name + "_inner", W, H, 4, folder);

        // hex burst behind the badge (like alert only)
        if (opt.burst) {
            // structure: Burst group > [Hex sub-group, Repeater x6 rotated 60 deg]
            // the Hex sub-group slides outward, the repeater spins six copies round the badge
            var bl = shapeLayer(inner, "Hex Burst");
            var burst = addGroup(bl, "Burst");
            var hexGroup = burst.addProperty("ADBE Vector Group");
            hexGroup.name = "Hex";
            var hc = hexGroup.property("ADBE Vectors Group");
            addPath(hc, polygon(0, 0, 12, 6));
            addFill(hc, C.blue);
            addRepeater(burst, 6, [0, 0], 60);
            bl.property("ADBE Transform Group").property("ADBE Position").setValue([150, Y]);
            // adding the repeater invalidates the old reference to the Hex group: look it up again by name
            var hexFresh = bl.property("ADBE Root Vectors Group").property("Burst")
                             .property("ADBE Vectors Group").property("Hex");
            var hexT = hexFresh.property("ADBE Vector Transform Group");
            var gpos = hexT.property("ADBE Vector Position");
            gpos.setValueAtTime(f(10), [0, -40]);
            gpos.setValueAtTime(f(34), [0, -150]);
            var gop = hexT.property("ADBE Vector Group Opacity");
            gop.setValueAtTime(f(10), 100);
            gop.setValueAtTime(f(34), 0);
            ease(gpos, 70);
            bl.inPoint = f(10); bl.outPoint = f(36);
        }

        // name tag (TikFinity writes the username inside it)
        var tag = shapeLayer(inner, "Tag");
        var tc = addGroup(tag, "Tag shape");
        addPath(tc, [[-430, -55], [430, -55], [400, 55], [-430, 55]]);
        addFill(tc, opt.tagColor);
        var tp = tag.property("ADBE Transform Group").property("ADBE Position");
        keys(tp, [[0, [-530, Y]], [10, [580, Y]], [14, [560, Y]]]);
        ease(tp, 75);

        // slivers
        function sliver(name, rgb, finalX, startFrame) {
            var s = shapeLayer(inner, name);
            var c = addGroup(s, name);
            addPath(c, [[-2, -55], [18, -55], [2, 55], [-18, 55]]);
            addFill(c, rgb);
            var p = s.property("ADBE Transform Group").property("ADBE Position");
            keys(p, [[startFrame, [finalX - 1090, Y]], [startFrame + 10, [finalX + 20, Y]], [startFrame + 14, [finalX, Y]]]);
            ease(p, 75);
            return s;
        }
        sliver("Sliver 1", opt.sliver1, 1010, 4);
        sliver("Sliver 2", opt.sliver2, 1036, 4);

        // light sweep over the tag only
        var sweep = inner.layers.addSolid(C.white, "Tag Sweep", 40, 180, 1, 4);
        sweep.blendingMode = BlendingMode.ADD;
        var swt = sweep.property("ADBE Transform Group");
        swt.property("ADBE Rotate Z").setValue(20);
        swt.property("ADBE Opacity").setValue(60);
        keys(swt.property("ADBE Position"), [[80, [110, Y]], [120, [1010, Y]]]);
        // matte = a copy of the tag sitting directly above the sweep (works in old and new AE)
        try {
            var m = tag.duplicate();
            m.name = "Tag (matte)";
            m.moveBefore(sweep);
            var matteDone = false;
            try { sweep.setTrackMatte(m, TrackMatteType.ALPHA); matteDone = true; } catch (e) {}
            if (!matteDone) sweep.trackMatteType = TrackMatteType.ALPHA;
        } catch (e2) { notes.push(opt.name + ": set the Tag Sweep's Track Matte to the Tag layer (Alpha Matte) by hand."); }

        // badge
        if (ring) {
            var b = inner.layers.add(ring);
            b.name = "Badge";
            b.timeRemapEnabled = true;
            // freeze on the finished, fully revealed badge (2.5 s into RING):
            // keep AE's two Time Remap keys and set both to 2.5 s
            try {
                var tr = b.property("ADBE Time Remapping");
                for (var k = 1; k <= tr.numKeys; k++) tr.setValueAtKey(k, 2.5);
            } catch (eTR) {
                notes.push(opt.name + ": on the Badge layer, set both Time Remap keyframes to 0:00:02:30 by hand.");
            }
            try { b.outPoint = 4; } catch (eOut) {}            // RING is 3 s long: stretch to the full 4 s
            var bt = b.property("ADBE Transform Group");
            bt.property("ADBE Position").setValue([150, Y]);
            var bs = bt.property("ADBE Scale");
            keys(bs, [[6, [0, 0]], [12, [26, 26]], [16, [22, 22]]]);
            ease(bs, 60);
        }

        // label
        var lbl = inner.layers.addText(opt.label);
        lbl.name = "Label";
        var tdProp = lbl.property("ADBE Text Properties").property("ADBE Text Document");
        var td = tdProp.value;
        try { td.font = LABEL_FONT; } catch (e) {}
        td.fontSize = 30;
        td.applyFill = true;
        td.fillColor = C.bone;
        td.applyStroke = false;
        td.tracking = 300;
        td.justification = ParagraphJustification.LEFT_JUSTIFY;
        tdProp.setValue(td);
        lbl.property("ADBE Transform Group").property("ADBE Position").setValue([270, Y - 72]);
        lbl.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
        // look everything up fresh after each add (AE invalidates older references)
        function animator() { return lbl.property("ADBE Text Properties").property("ADBE Text Animators").property(1); }
        animator().property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
        animator().property("ADBE Text Animator Properties").property("ADBE Text Opacity").setValue(0);
        var sels = animator().property("ADBE Text Selectors");
        if (sels.numProperties === 0) sels.addProperty("ADBE Text Selector");
        var sel = animator().property("ADBE Text Selectors").property(1);
        keys(sel.property("ADBE Text Percent Start"), [[10, 0], [24, 100]]);

        // outer comp: slide + fade everything out at the end
        var outer = newComp(opt.name, W, H, 4, folder);
        var il = outer.layers.add(inner);
        var it = il.property("ADBE Transform Group");
        keys(it.property("ADBE Position"), [[180, [W / 2, H / 2]], [220, [W / 2 + 300, H / 2]]]);
        keys(it.property("ADBE Opacity"), [[180, 100], [220, 0]]);
        ease(it.property("ADBE Position"), 60);

        var snd = importSound(opt.sound);
        if (snd) {
            snd.parentFolder = folder;
            var sl = outer.layers.add(snd);
            sl.startTime = 0;
        } else {
            notes.push(opt.name + ": " + opt.sound + " was not found next to the script, so it has no sound yet.");
        }
        return outer;
    }

    function queue(comp, templates) {
        var rq = app.project.renderQueue.items.add(comp);
        var om = rq.outputModule(1);
        for (var i = 0; i < templates.length; i++) {
            try { om.applyTemplate(templates[i]); return; } catch (e) {}
        }
        notes.push(comp.name + ": set its Output Module by hand (see section 6 of the build guide).");
    }

    // ---- run ------------------------------------------------------------------
    if (!app.project) { alert("Open your VYPER-VENOM project first."); return; }
    app.beginUndoGroup("VYPER-VENOM build");
    try {
        var folder = app.project.items.addFolder("VV_Script_Build");
        var ring = findComp("RING");
        if (!ring) notes.push("No comp called RING was found, so the alerts have no badge. Rename your badge comp to RING and run again, or drag it in by hand.");

        var loops = [
            buildLoop("BG_LOOP_TW", 1920, 1080, folder),
            buildLoop("BG_LOOP_TT", 1080, 1920, folder)
        ];
        var alerts = [
            buildAlert({ name: "ALERT_FOLLOW", h: 400, y: 250, tagColor: C.red,  sliver1: C.blue, sliver2: C.blood,
                         label: "NEW FOLLOWER", sound: "ALERT_FOLLOW.wav" }, folder, ring),
            buildAlert({ name: "ALERT_SHARE",  h: 400, y: 250, tagColor: C.blue, sliver1: C.red,  sliver2: C.blood,
                         label: "SHARED THE STREAM", sound: "ALERT_SHARE.wav" }, folder, ring),
            buildAlert({ name: "ALERT_LIKE",   h: 300, y: 180, tagColor: C.red,  sliver1: C.blue, sliver2: C.blood,
                         label: "LIKE GOAL", sound: "ALERT_LIKE.wav", burst: true }, folder, ring),
            // Twitch alerts (played by the overlay's ?twitch mode, events from Streamer.bot)
            buildAlert({ name: "ALERT_SUB",    h: 400, y: 250, tagColor: C.blue, sliver1: C.red,  sliver2: C.blood,
                         label: "NEW SUBSCRIBER", sound: "ALERT_SHARE.wav" }, folder, ring),
            buildAlert({ name: "ALERT_BITS",   h: 400, y: 250, tagColor: C.red,  sliver1: C.blue, sliver2: C.blood,
                         label: "BITS CHEER", sound: "ALERT_FOLLOW.wav" }, folder, ring),
            buildAlert({ name: "ALERT_RAID",   h: 300, y: 180, tagColor: C.red,  sliver1: C.blue, sliver2: C.blood,
                         label: "INCOMING RAID", sound: "ALERT_LIKE.wav", burst: true }, folder, ring)
        ];

        for (var i = 0; i < loops.length; i++)
            queue(loops[i], ["H.264 - Match Render Settings - 15 Mbps", "H.264 - Match Render Settings - 40 Mbps", "H.264"]);
        for (var j = 0; j < alerts.length; j++)
            queue(alerts[j], ["High Quality with Alpha", "Lossless with Alpha"]);

        var msg = "Done! New comps are in the VV_Script_Build folder and in the Render Queue.\n\n" +
                  "Alerts render as ProRes 4444 with alpha: convert them to WebM in Shutter Encoder (VP9, Enable alpha channel).\n" +
                  "Loops render as H.264 MP4: no conversion needed.";
        if (notes.length) msg += "\n\nThings to check:\n- " + notes.join("\n- ");
        alert(msg);
    } catch (err) {
        alert("Something went wrong on line " + err.line + ":\n" + err.toString() +
              "\n\nUse Edit > Undo \"VYPER-VENOM build\" to remove anything half-built, then send Claude a screenshot of this message.");
    }
    app.endUndoGroup();
})();
