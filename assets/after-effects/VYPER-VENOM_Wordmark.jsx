/*  VYPER-VENOM wordmark logo for After Effects
    Builds the faceless logo (glitched VYPER, red VENOM tag, fang, inside the HUD plate)
    as a NEW comp, LOGO_WORDMARK: 1200x1200, 60 fps, 4 s, transparent background.
    Everything is real shape and text layers, so it stays sharp at any size and is easy to tweak.

    Animation:
      0:00-0:34  frame draws on, plate fills in, corner brackets slide in
      0:36-0:50  VYPER glitches in (red/blue split, flicker, slice)
      0:52-1:36  VENOM tag slides in, text fades up, fang drops, bars wipe on
      3:00-3:06  a small glitch again, then it holds (good for looping or an outro)

    Needs Orbitron installed in Windows (Orbitron-Black and Orbitron-ExtraBold).
    How to run: File > Scripts > Run Script File... and pick this file.
    Undo with Edit > Undo "VYPER-VENOM wordmark".
*/

(function () {
    var FPS = 60, W = 1200, H = 1200, DUR = 4;
    var S = 2;                       // the design was drawn on a 600 grid; everything is x2
    var C = {
        black: hex("0A0A0D"), gun: hex("16141C"), red: hex("E3132B"),
        blood: hex("6E0A14"), blue: hex("2E55FF"), bone: hex("F1EDF4")
    };
    var FONT_BIG = "Orbitron-Black", FONT_TAG = "Orbitron-ExtraBold";
    var notes = [];

    function hex(h) { return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; }
    function f(n) { return n / FPS; }
    function P(x, y) { return [x * S, y * S]; }

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

    // keys: [[frame, value], ...]; hold=true makes them jump (glitch), otherwise eased
    function keys(prop, list, hold) {
        for (var i = 0; i < list.length; i++) prop.setValueAtTime(f(list[i][0]), list[i][1]);
        for (var k = 1; k <= prop.numKeys; k++) {
            if (hold) {
                prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD);
            } else {
                var dims = (prop.value instanceof Array) ? prop.value.length : 1;
                if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) dims = 1;
                var e = [];
                for (var d = 0; d < dims; d++) e.push(new KeyframeEase(0, 70));
                try { prop.setTemporalEaseAtKey(k, e, e); } catch (err) {}
            }
        }
    }

    // a shape layer from a list of points (600-grid). origin = the point the layer scales/moves around.
    function shape(comp, name, pts, origin, opt) {
        var l = comp.layers.addShape();
        l.name = name;
        var o = P(origin[0], origin[1]);
        var verts = [];
        for (var i = 0; i < pts.length; i++) verts.push([pts[i][0] * S - o[0], pts[i][1] * S - o[1]]);
        l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").name = name;
        function V() { return l.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group"); }
        V().addProperty("ADBE Vector Shape - Group");
        var sh = new Shape();
        sh.vertices = verts;
        sh.closed = (opt.closed !== false);
        V().property(1).property("ADBE Vector Shape").setValue(sh);
        if (opt.fill) {
            V().addProperty("ADBE Vector Graphic - Fill");
            V().property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(opt.fill);
        }
        if (opt.stroke) {
            V().addProperty("ADBE Vector Graphic - Stroke");
            var st = V().property("ADBE Vector Graphic - Stroke");
            st.property("ADBE Vector Stroke Color").setValue(opt.stroke);
            st.property("ADBE Vector Stroke Width").setValue(opt.width * S);
            try { st.property("ADBE Vector Stroke Line Join").setValue(1); } catch (e) {}   // miter
        }
        if (opt.trim) V().addProperty("ADBE Vector Filter - Trim");
        var t = l.property("ADBE Transform Group");
        t.property("ADBE Anchor Point").setValue([0, 0]);
        t.property("ADBE Position").setValue(o);
        return l;
    }

    function vec(l) { return l.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group"); }

    function text(comp, name, str, font, size, tracking, col, pos) {
        var l = comp.layers.addText(str);
        l.name = name;
        var p = l.property("ADBE Text Properties").property("ADBE Text Document");
        var td = p.value;
        try { td.font = font; } catch (e) {}
        td.fontSize = size * S;
        td.applyFill = true;
        td.fillColor = col;
        td.applyStroke = false;
        td.tracking = tracking;
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        p.setValue(td);
        if (p.value.font !== font) notes.push(name + ": font " + font + " wasn't found. Install Orbitron, then pick it in the Character panel.");
        l.property("ADBE Transform Group").property("ADBE Position").setValue(P(pos[0], pos[1]));
        return l;
    }

    // a rectangle mask in layer space (text layers: 0,0 is the baseline centre)
    function bandMask(layer, top, bottom, mode) {
        var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        var sh = new Shape();
        sh.vertices = [[-800, top * S], [800, top * S], [800, bottom * S], [-800, bottom * S]];
        sh.closed = true;
        m.property("ADBE Mask Shape").setValue(sh);
        m.maskMode = mode;
        return m;
    }

    if (!app.project) { alert("Open your VYPER-VENOM project first."); return; }
    app.beginUndoGroup("VYPER-VENOM wordmark");
    try {
        var folder = app.project.items.addFolder("VV_Wordmark");
        var comp = app.project.items.addComp(uniqueName("LOGO_WORDMARK"), W, H, 1, DUR, FPS);
        comp.bgColor = C.black;
        comp.parentFolder = folder;

        // ---- frame ------------------------------------------------------------
        var plateFill = shape(comp, "Plate Fill", [[70, 120], [500, 120], [530, 150], [530, 480], [100, 480], [70, 450]], [300, 300], { fill: C.gun });
        keys(plateFill.property("ADBE Transform Group").property("ADBE Opacity"), [[14, 0], [34, 100]]);

        var plateLine = shape(comp, "Plate Line", [[70, 120], [500, 120], [530, 150], [530, 480], [100, 480], [70, 450]], [300, 300], { stroke: C.red, width: 6, trim: true });
        keys(vec(plateLine).property("ADBE Vector Filter - Trim").property("ADBE Vector Trim End"), [[0, 0], [30, 100]]);

        var brTL = shape(comp, "Bracket TL", [[40, 170], [40, 90], [120, 90]], [40, 90], { stroke: C.blue, width: 6, closed: false });
        keys(brTL.property("ADBE Transform Group").property("ADBE Position"), [[18, P(10, 60)], [34, P(40, 90)]]);
        keys(brTL.property("ADBE Transform Group").property("ADBE Opacity"), [[18, 0], [26, 100]]);

        var brBR = shape(comp, "Bracket BR", [[560, 430], [560, 510], [480, 510]], [560, 510], { stroke: C.blue, width: 6, closed: false });
        keys(brBR.property("ADBE Transform Group").property("ADBE Position"), [[18, P(590, 540)], [34, P(560, 510)]]);
        keys(brBR.property("ADBE Transform Group").property("ADBE Opacity"), [[18, 0], [26, 100]]);

        // ---- small bars, bottom left -------------------------------------------
        var barR = shape(comp, "Bar Red", [[100, 440], [170, 440], [170, 448], [100, 448]], [100, 444], { fill: C.red });
        keys(barR.property("ADBE Transform Group").property("ADBE Scale"), [[78, [0, 100]], [92, [100, 100]]]);
        var barB = shape(comp, "Bar Blue", [[180, 440], [204, 440], [204, 448], [180, 448]], [180, 444], { fill: C.blue });
        keys(barB.property("ADBE Transform Group").property("ADBE Scale"), [[86, [0, 100]], [96, [100, 100]]]);

        // ---- VYPER with glitch -------------------------------------------------
        // red and blue split copies behind the white
        var vr = text(comp, "VYPER Red", "VYPER", FONT_BIG, 86, 23, C.red, [296, 268]);
        keys(vr.property("ADBE Transform Group").property("ADBE Opacity"), [[0, 0], [36, 90]], true);
        keys(vr.property("ADBE Transform Group").property("ADBE Position"),
             [[36, P(280, 268)], [40, P(292, 268)], [44, P(286, 268)], [48, P(296, 268)], [180, P(284, 268)], [183, P(296, 268)]], true);

        var vb = text(comp, "VYPER Blue", "VYPER", FONT_BIG, 86, 23, C.blue, [304, 268]);
        keys(vb.property("ADBE Transform Group").property("ADBE Opacity"), [[0, 0], [36, 90]], true);
        keys(vb.property("ADBE Transform Group").property("ADBE Position"),
             [[36, P(320, 268)], [40, P(308, 268)], [44, P(314, 268)], [48, P(304, 268)], [180, P(316, 268)], [183, P(304, 268)]], true);

        // white, with the slice band cut out (the slice layer fills it, shifted right)
        var vw = text(comp, "VYPER", "VYPER", FONT_BIG, 86, 23, C.bone, [300, 268]);
        bandMask(vw, -36, -24, MaskMode.SUBTRACT);
        keys(vw.property("ADBE Transform Group").property("ADBE Opacity"), [[0, 0], [38, 100], [41, 0], [43, 100], [180, 0], [182, 100]], true);

        var vs = text(comp, "VYPER Slice", "VYPER", FONT_BIG, 86, 23, C.bone, [310, 268]);
        bandMask(vs, -36, -24, MaskMode.ADD);
        keys(vs.property("ADBE Transform Group").property("ADBE Opacity"), [[0, 0], [43, 100]], true);
        keys(vs.property("ADBE Transform Group").property("ADBE Position"),
             [[43, P(330, 268)], [46, P(285, 268)], [50, P(310, 268)], [180, P(280, 268)], [183, P(330, 268)], [186, P(310, 268)]], true);

        // ---- VENOM tag ---------------------------------------------------------
        var tag = shape(comp, "Tag", [[168, 300], [452, 300], [434, 364], [150, 364]], [301, 332], { fill: C.red });
        var tt = tag.property("ADBE Transform Group");
        keys(tt.property("ADBE Position"), [[52, P(60, 332)], [64, P(309, 332)], [70, P(301, 332)]]);
        keys(tt.property("ADBE Opacity"), [[52, 0], [56, 100]]);

        var fang = shape(comp, "Fang", [[287, 364], [315, 364], [301, 398]], [301, 364], { fill: C.red });
        keys(fang.property("ADBE Transform Group").property("ADBE Scale"), [[72, [100, 0]], [82, [100, 100]]]);

        var ven = text(comp, "VENOM", "VENOM", FONT_TAG, 42, 381, C.bone, [301, 349]);
        var vt = ven.property("ADBE Transform Group");
        keys(vt.property("ADBE Opacity"), [[62, 0], [72, 100]]);
        keys(vt.property("ADBE Position"), [[62, P(301, 359)], [72, P(301, 349)]]);

        // ---- render ------------------------------------------------------------
        var rq = app.project.renderQueue.items.add(comp);
        var om = rq.outputModule(1), ok = false;
        var tpl = ["High Quality with Alpha", "Lossless with Alpha"];
        for (var t = 0; t < tpl.length && !ok; t++) { try { om.applyTemplate(tpl[t]); ok = true; } catch (e) {} }
        if (!ok) notes.push("Set the Output Module to ProRes 4444, RGB + Alpha, Straight by hand.");

        comp.openInViewer();
        var msg = "Done! LOGO_WORDMARK is in the VV_Wordmark folder and in the Render Queue.\n\n" +
                  "Render it, then convert to WebM in Shutter Encoder (VP9, Enable alpha channel) if you want it in OBS.\n" +
                  "For a still, go to 0:03:00 and use Composition > Save Frame As > File (PNG, RGB + Alpha).";
        if (notes.length) msg += "\n\nThings to check:\n- " + notes.join("\n- ");
        alert(msg);
    } catch (err) {
        alert("Something went wrong on line " + err.line + ":\n" + err.toString() +
              "\n\nUse Edit > Undo \"VYPER-VENOM wordmark\", then send Claude a screenshot of this message.");
    }
    app.endUndoGroup();
})();
