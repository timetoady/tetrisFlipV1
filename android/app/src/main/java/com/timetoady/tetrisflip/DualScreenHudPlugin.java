package com.timetoady.tetrisflip;

import android.app.Presentation;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.hardware.display.DisplayManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.Display;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;

import android.webkit.JavascriptInterface;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Locale;

@CapacitorPlugin(name = "DualScreenHud")
public class DualScreenHudPlugin extends Plugin {
    private static final int COLOR_BG = Color.rgb(7, 10, 16);
    private static final int COLOR_PANEL = Color.argb(150, 10, 16, 24);
    private static final int COLOR_PANEL_STRONG = Color.argb(184, 9, 13, 20);
    private static final int COLOR_CYAN = Color.rgb(76, 195, 255);
    private static final int COLOR_CYAN_SOFT = Color.argb(140, 76, 195, 255);
    private static final int COLOR_TEXT = Color.rgb(232, 236, 242);
    private static final int COLOR_TEXT_SOFT = Color.rgb(170, 182, 194);
    private static final int COLOR_TEXT_DIM = Color.argb(185, 228, 232, 238);
    private static final int COLOR_SCORE = Color.rgb(255, 214, 84);
    private static final int COLOR_STROKE = Color.argb(96, 255, 255, 255);
    private static final int COLOR_STROKE_STRONG = Color.argb(160, 255, 255, 255);
    private static final int COLOR_MONO_FILL = Color.argb(26, 255, 255, 255);
    private static final int COLOR_MONO_STROKE = Color.argb(228, 255, 255, 255);
    private static final int COLOR_WARN = Color.rgb(255, 154, 107);
    private static final int COLOR_OK = Color.rgb(76, 255, 154);
    private static final int COLOR_MENU_BG = Color.rgb(10, 10, 12);
    private static final int COLOR_MENU_PANEL = Color.argb(236, 14, 14, 16);
    private static final int COLOR_MENU_FILL = Color.argb(64, 255, 255, 255);
    private static final int COLOR_MENU_STROKE = Color.argb(190, 248, 244, 255);
    private static final int COLOR_MENU_HILITE_BG = Color.argb(224, 18, 20, 24);
    private static final int COLOR_MENU_INNER_STROKE = Color.argb(72, 255, 255, 255);
    private static final int[] PIECE_TYPES = {1, 2, 3, 4, 5, 6, 7};

    private DualScreenHudController controller;

    @Override
    public void load() {
        controller = new DualScreenHudController(getActivity());
        if (getBridge() != null && getBridge().getWebView() != null) {
            getActivity().runOnUiThread(() -> {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().addJavascriptInterface(new Object() {
                        @JavascriptInterface
                        public void pushFrame(String cells, double score, double level, double lines, String status, boolean isFlipped) {
                            pushFrame(cells, score, level, lines, status, isFlipped, 0.0, 0.0, 0.0, 0.0);
                        }

                        @JavascriptInterface
                        public void pushFrame(String cells, double score, double level, double lines, String status, boolean isFlipped, double cellSize, double gridLeft, double gridTop) {
                            pushFrame(cells, score, level, lines, status, isFlipped, cellSize, gridLeft, gridTop, 0.0);
                        }

                        @JavascriptInterface
                        public void pushFrame(String cells, double score, double level, double lines, String status, boolean isFlipped, double cellSize, double gridLeft, double gridTop, double viewportW) {
                            getActivity().runOnUiThread(() -> {
                                if (controller != null && controller.hasPresentation()) {
                                    controller.pushFrame(cells, (int) score, (int) level, (int) lines, status, isFlipped, (float) cellSize, (float) gridLeft, (float) gridTop, (float) viewportW);
                                }
                            });
                        }
                    }, "DualScreenHudBridge");
                }
            });
        }
    }

    @PluginMethod
    public void setEnabled(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        getActivity().runOnUiThread(() -> {
            controller.setEnabled(enabled);
            JSObject ret = new JSObject();
            ret.put("enabled", controller.isEnabled());
            ret.put("active", controller.hasPresentation());
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void updateHud(PluginCall call) {
        JSObject data = call.getData();
        getActivity().runOnUiThread(() -> {
            controller.updateHud(data);
            JSObject ret = new JSObject();
            ret.put("enabled", controller.isEnabled());
            ret.put("active", controller.hasPresentation());
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void exitApp(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (controller != null) {
                controller.dismissPresentation();
            }
            call.resolve();
            getActivity().finishAndRemoveTask();
        });
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (controller != null) {
            controller.refreshDisplays();
        }
    }

    @Override
    protected void handleOnPause() {
        super.handleOnPause();
        if (controller != null) {
            controller.dismissPresentation();
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (controller != null) {
            controller.destroy();
            controller = null;
        }
        super.handleOnDestroy();
    }

    static class DualScreenHudController implements DisplayManager.DisplayListener {
        private final Context context;
        private final DisplayManager displayManager;
        private boolean enabled = true;
        private HudPresentation presentation;
        private JSObject lastHud;

        DualScreenHudController(Context context) {
            this.context = context;
            this.displayManager = (DisplayManager) context.getSystemService(Context.DISPLAY_SERVICE);
            if (displayManager != null) {
                displayManager.registerDisplayListener(this, new Handler(Looper.getMainLooper()));
            }
        }

        boolean isEnabled() {
            return enabled;
        }

        boolean hasPresentation() {
            return presentation != null && presentation.isShowing();
        }

        void setEnabled(boolean enabled) {
            this.enabled = enabled;
            if (enabled) {
                refreshDisplays();
            } else {
                dismissPresentation();
            }
        }

        void updateHud(JSObject hud) {
            lastHud = hud;
            if (enabled) {
                refreshDisplays();
                if (presentation != null) {
                    presentation.updateHud(hud);
                }
            }
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped) {
            pushFrame(cells, score, level, lines, status, isFlipped, 0f, 0f, 0f, 0f);
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped, float cellSize, float gridLeft, float gridTop) {
            pushFrame(cells, score, level, lines, status, isFlipped, cellSize, gridLeft, gridTop, 0f);
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped, float cellSize, float gridLeft, float gridTop, float viewportW) {
            if (enabled && presentation != null) {
                presentation.pushFrame(cells, score, level, lines, status, isFlipped, cellSize, gridLeft, gridTop, viewportW);
            }
        }

        void refreshDisplays() {
            if (!enabled || displayManager == null) return;
            Display[] displays = displayManager.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);
            Display target = displays.length > 0 ? displays[0] : null;
            if (target == null) {
                dismissPresentation();
                return;
            }
            if (presentation != null && presentation.getDisplay().getDisplayId() == target.getDisplayId()) {
                return;
            }
            dismissPresentation();
            presentation = new HudPresentation(context, target);
            try {
                presentation.show();
                if (lastHud != null) {
                    presentation.updateHud(lastHud);
                }
            } catch (WindowManager.InvalidDisplayException ex) {
                presentation = null;
            }
        }

        void dismissPresentation() {
            if (presentation == null) return;
            try {
                presentation.dismiss();
            } catch (RuntimeException ignored) {
                // The target display may already be gone.
            }
            presentation = null;
        }

        void destroy() {
            dismissPresentation();
            if (displayManager != null) {
                displayManager.unregisterDisplayListener(this);
            }
        }

        @Override
        public void onDisplayAdded(int displayId) {
            refreshDisplays();
        }

        @Override
        public void onDisplayRemoved(int displayId) {
            refreshDisplays();
        }

        @Override
        public void onDisplayChanged(int displayId) {
            refreshDisplays();
        }
    }

    private static float clamp(float value, float min, float max) {
        return Math.max(min, Math.min(max, value));
    }

    private static int intValue(JSONObject obj, String key, int fallback) {
        if (obj == null) return fallback;
        return obj.optInt(key, fallback);
    }

    private static long longValue(JSONObject obj, String key, long fallback) {
        if (obj == null) return fallback;
        return obj.optLong(key, fallback);
    }

    private static int pieceType(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return -1;
    }

    private static String formatHudTime(long ms) {
        long safe = Math.max(0L, ms);
        long minutes = safe / 60000L;
        long seconds = (safe % 60000L) / 1000L;
        long tenths = (safe % 1000L) / 100L;
        return String.format(Locale.US, "%d:%02d.%d", minutes, seconds, tenths);
    }

    private static int[][] pieceCells(int type) {
        switch (type) {
            case 1:
                return new int[][]{{0, 1}, {1, 1}, {2, 1}, {3, 1}};
            case 2:
                return new int[][]{{0, 0}, {0, 1}, {1, 1}, {2, 1}};
            case 3:
                return new int[][]{{2, 0}, {0, 1}, {1, 1}, {2, 1}};
            case 4:
                return new int[][]{{1, 0}, {2, 0}, {1, 1}, {2, 1}};
            case 5:
                return new int[][]{{1, 0}, {2, 0}, {0, 1}, {1, 1}};
            case 6:
                return new int[][]{{1, 0}, {0, 1}, {1, 1}, {2, 1}};
            case 7:
                return new int[][]{{0, 0}, {1, 0}, {1, 1}, {2, 1}};
            case 8:
                return new int[][]{{0, 0}, {1, 0}, {2, 0}, {3, 0}};
            default:
                return new int[0][0];
        }
    }

    private static int pieceColor(JSONArray colors, int value) {
        if (colors != null) {
            String color = colors.optString(value, null);
            if (color != null && color.startsWith("#")) {
                try {
                    return Color.parseColor(color);
                } catch (IllegalArgumentException ignored) {
                    // Fall through to defaults below.
                }
            }
        }
        switch (value) {
            case 1:
                return Color.rgb(0, 240, 240);
            case 2:
                return Color.rgb(0, 0, 240);
            case 3:
                return Color.rgb(240, 160, 0);
            case 4:
                return Color.rgb(240, 240, 0);
            case 5:
                return Color.rgb(0, 240, 0);
            case 6:
                return Color.rgb(160, 0, 240);
            case 7:
                return Color.rgb(240, 0, 0);
            case 8:
                return Color.rgb(122, 122, 122);
            default:
                return Color.rgb(55, 68, 80);
        }
    }

    private static void drawBackdrop(Canvas canvas, Paint paint, float width, float height) {
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(Math.max(2f, Math.min(width, height) * 0.006f));
        drawBackdropPiece(canvas, paint, 6, width * 0.18f, height * 0.24f, Math.min(width, height) * 0.05f, Color.argb(30, 92, 222, 255));
        drawBackdropPiece(canvas, paint, 3, width * 0.50f, height * 0.18f, Math.min(width, height) * 0.045f, Color.argb(26, 255, 214, 84));
        drawBackdropPiece(canvas, paint, 5, width * 0.72f, height * 0.64f, Math.min(width, height) * 0.05f, Color.argb(24, 94, 255, 165));
        drawBackdropPiece(canvas, paint, 7, width * 0.28f, height * 0.74f, Math.min(width, height) * 0.043f, Color.argb(18, 255, 120, 120));
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.argb(24, 76, 195, 255));
        canvas.drawCircle(width * 0.82f, height * 0.17f, Math.min(width, height) * 0.16f, paint);
        paint.setColor(Color.argb(18, 94, 255, 165));
        canvas.drawCircle(width * 0.16f, height * 0.90f, Math.min(width, height) * 0.19f, paint);
        paint.setColor(Color.argb(24, 255, 214, 84));
        canvas.drawCircle(width * 0.63f, height * 0.82f, Math.min(width, height) * 0.12f, paint);
    }

    private static void drawBackdropPiece(Canvas canvas, Paint paint, int type, float left, float top, float cell, int color) {
        int[][] cells = pieceCells(type);
        if (cells.length == 0) return;
        paint.setColor(color);
        for (int[] block : cells) {
            float x = left + block[0] * cell;
            float y = top + block[1] * cell;
            canvas.drawRoundRect(new RectF(x, y, x + cell, y + cell), cell * 0.18f, cell * 0.18f, paint);
        }
    }

    static class HudPresentation extends Presentation {
        private InfoHudView infoHud;
        private GameBoardView gameBoard;

        HudPresentation(Context outerContext, Display display) {
            super(outerContext, display);
        }

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            Window window = getWindow();
            if (window != null) {
                window.addFlags(WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE);
            }
            setContentView(buildView());
            showWaiting();
        }

        private FrameLayout buildView() {
            FrameLayout root = new FrameLayout(getContext());
            root.setBackgroundColor(COLOR_BG);
            infoHud = new InfoHudView(getContext());
            gameBoard = new GameBoardView(getContext());
            gameBoard.setVisibility(View.GONE);
            root.addView(infoHud, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ));
            root.addView(gameBoard, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ));
            return root;
        }

        void showWaiting() {
            if (infoHud != null) {
                infoHud.showWaiting();
            }
        }

        void updateHud(JSObject hud) {
            if (hud == null) return;
            String displayMode = hud.optString("displayMode", "info");
            if ("game".equals(displayMode)) {
                // Check if the board cells are sent as a flat base-36 string (from JS fallback path)
                JSONObject board = hud.optJSONObject("board");
                String flatCells = board != null ? board.optString("cells", null) : null;
                double cellSize = hud.optDouble("cellSize", 0.0);
                double gridLeft = hud.optDouble("gridLeft", 0.0);
                double gridTop = hud.optDouble("gridTop", 0.0);
                double viewportW = hud.optDouble("viewportW", 0.0);
                if (flatCells != null && flatCells.length() > 0 && board.optJSONArray("cells") == null) {
                    // Flat string path: route to pushFrame
                    JSONObject scoreObj = hud.optJSONObject("score");
                    int score = scoreObj != null ? scoreObj.optInt("score", 0) : 0;
                    int level = scoreObj != null ? scoreObj.optInt("level", 0) : 0;
                    int lines = scoreObj != null ? scoreObj.optInt("lines", 0) : 0;
                    String status = hud.optString("status", "Playing");
                    boolean isFlipped = hud.optBoolean("isFlipped", false);
                    pushFrame(flatCells, score, level, lines, status, isFlipped, (float) cellSize, (float) gridLeft, (float) gridTop, (float) viewportW);
                    return;
                }
                infoHud.setVisibility(View.GONE);
                gameBoard.setVisibility(View.VISIBLE);
                gameBoard.update(
                    board,
                    hud.optJSONObject("score"),
                    hud.optString("modeLabel", hud.optString("mode", "Marathon")),
                    hud.optString("status", "Playing"),
                    (float) cellSize,
                    (float) gridLeft,
                    (float) gridTop,
                    (float) viewportW
                );
                return;
            }

            gameBoard.setVisibility(View.GONE);
            infoHud.setVisibility(View.VISIBLE);
            infoHud.update(hud);
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped) {
            pushFrame(cells, score, level, lines, status, isFlipped, 0f, 0f, 0f, 0f);
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped, float cellSize, float gridLeft, float gridTop) {
            pushFrame(cells, score, level, lines, status, isFlipped, cellSize, gridLeft, gridTop, 0f);
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped, float cellSize, float gridLeft, float gridTop, float viewportW) {
            if (infoHud != null) {
                infoHud.setVisibility(View.GONE);
            }
            if (gameBoard != null) {
                gameBoard.setVisibility(View.VISIBLE);
                gameBoard.pushFrame(cells, score, level, lines, status, isFlipped, cellSize, gridLeft, gridTop, viewportW);
            }
        }
    }

    static class InfoHudView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private JSObject hud;
        private String waitingText = "Waiting for game";

        InfoHudView(Context context) {
            super(context);
        }

        void showWaiting() {
            hud = null;
            waitingText = "Waiting for game";
            invalidate();
        }

        void update(JSObject hud) {
            this.hud = hud;
            this.waitingText = hud == null ? "Waiting for game" : hud.optString("status", "Playing");
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float width = getWidth();
            float height = getHeight();

            if (hud == null) {
                canvas.drawColor(COLOR_BG);
                drawBackdrop(canvas, paint, width, height);
                paint.setColor(COLOR_TEXT);
                paint.setTypeface(Typeface.MONOSPACE);
                paint.setTextAlign(Paint.Align.CENTER);
                paint.setTextSize(dp(22));
                canvas.drawText(waitingText, width / 2f, height / 2f, paint);
                return;
            }

            JSONObject menu = hud.optJSONObject("menu");
            if (menu != null) {
                canvas.drawColor(COLOR_MENU_BG);
                drawMenuScreen(canvas, width, height, menu);
                return;
            }

            canvas.drawColor(COLOR_BG);
            drawBackdrop(canvas, paint, width, height);
            JSONObject scoreState = hud.optJSONObject("score");
            JSONObject queue = hud.optJSONObject("queue");
            JSONObject p2Queue = hud.optJSONObject("p2Queue");
            JSONObject p2Score = hud.optJSONObject("p2Score");
            JSONObject garbage = hud.optJSONObject("garbage");
            JSONObject redemption = hud.optJSONObject("redemption");
            JSONObject runStats = hud.optJSONObject("runStats");
            JSONObject momentum = hud.optJSONObject("momentum");
            String modeText = hud.optString("modeLabel", hud.optString("mode", "Marathon")).toUpperCase(Locale.US);
            String statusText = hud.optString("status", "Playing").toUpperCase(Locale.US);

            float pad = dp(18);
            float gap = dp(12);
            float headerTop = pad + dp(4);
            float headerHeight = dp(28);
            float panelTop = headerTop + headerHeight;
            float panelBottom = height - pad;
            float totalWidth = width - pad * 2f - gap * 2f;
            float leftWidth = totalWidth * 0.36f;
            float centerWidth = totalWidth * 0.24f;

            RectF leftRect = new RectF(pad, panelTop, pad + leftWidth, panelBottom);
            RectF centerRect = new RectF(leftRect.right + gap, panelTop, leftRect.right + gap + centerWidth, panelBottom);
            RectF rightRect = new RectF(centerRect.right + gap, panelTop, pad + totalWidth + gap * 2f, panelBottom);

            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextSize(dp(13));
            paint.setColor(COLOR_CYAN);
            paint.setTextAlign(Paint.Align.LEFT);
            canvas.drawText(modeText, pad, headerTop + dp(13), paint);
            paint.setTextAlign(Paint.Align.RIGHT);
            paint.setColor(COLOR_TEXT_SOFT);
            canvas.drawText(statusText + " / INFO", width - pad, headerTop + dp(13), paint);

            drawPanel(canvas, leftRect, false);
            drawPanel(canvas, centerRect, false);
            drawPanel(canvas, rightRect, true);

            drawScorePanel(canvas, leftRect, scoreState);
            drawQueuePanel(canvas, centerRect, scoreState, queue, momentum);

            if (p2Score != null) {
                drawCoopPanel(canvas, rightRect, p2Score, p2Queue);
            } else if (garbage != null) {
                drawGarbagePanel(canvas, rightRect, garbage);
            } else if (redemption != null) {
                drawRedemptionPanel(canvas, rightRect, redemption);
            } else if (runStats != null) {
                drawRunPanel(canvas, rightRect, runStats);
            } else {
                drawFallbackPanel(canvas, rightRect, modeText, scoreState, momentum);
            }
        }

        private void drawMenuScreen(Canvas canvas, float width, float height, JSONObject menu) {
            String layout = menu.optString("layout", "mode");
            RectF panel = drawMenuFrame(canvas, width, height);
            if ("splash".equals(layout)) {
                drawSplashMenuScreen(canvas, panel, menu);
                postInvalidateOnAnimation();
                return;
            }
            if ("options".equals(layout) || "help".equals(layout)) {
                drawOptionsMenuScreen(canvas, panel, menu);
                return;
            }
            drawModeMenuScreen(canvas, panel, menu);
        }

        private RectF drawMenuFrame(Canvas canvas, float width, float height) {
            float pad = dp(16);
            float outerPad = dp(10);
            RectF frame = new RectF(outerPad, outerPad, width - outerPad, height - outerPad);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.5f));
            paint.setColor(COLOR_MENU_STROKE);
            canvas.drawRect(frame, paint);

            RectF panel = new RectF(frame.left + pad, frame.top + pad, frame.right - pad, frame.bottom - pad);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(COLOR_MENU_PANEL);
            canvas.drawRect(panel, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.25f));
            paint.setColor(Color.argb(90, 255, 255, 255));
            canvas.drawRect(panel, paint);
            paint.setStyle(Paint.Style.FILL);
            return panel;
        }

        private void drawModeMenuScreen(Canvas canvas, RectF panel, JSONObject menu) {
            String title = menu.optString("title", "MENU");
            String instruction = menu.optString("instruction", "");
            String description = menu.optString("description", "");
            String selected = menu.optString("selected", "");
            String detail = menu.optString("detail", "");
            String hint = menu.optString("hint", "");

            drawMenuTitle(canvas, panel, title, dp(16));

            if (!instruction.isEmpty()) {
                drawCenteredMenuText(canvas, instruction, panel.centerX(), panel.top + dp(42), COLOR_TEXT_DIM, dp(11), dp(9), panel.width() - dp(40));
            }

            float descriptionTop = panel.top + (instruction.isEmpty() ? dp(44) : dp(62));
            if (!description.isEmpty()) {
                drawMenuDescription(canvas, panel, description, descriptionTop, dp(12), dp(15));
            }

            if (!selected.isEmpty()) {
                float rowTop = panel.centerY() + dp(8);
                RectF selectedBox = new RectF(panel.left + dp(18), rowTop, panel.right - dp(18), rowTop + dp(42));
                drawMenuSelectionBox(canvas, selectedBox);
                drawMenuSelectionText(canvas, selectedBox, selected, detail);
            }

            if (!hint.isEmpty()) {
                drawCenteredMenuText(canvas, hint, panel.centerX(), panel.bottom - dp(14), COLOR_TEXT_DIM, dp(11), dp(9), panel.width() - dp(32));
            }
        }

        private void drawOptionsMenuScreen(Canvas canvas, RectF panel, JSONObject menu) {
            String title = menu.optString("title", "OPTIONS");
            String description = menu.optString("description", "");
            String selectedLabel = menu.optString("selectedLabel", "");
            String selectedValue = menu.optString("selectedValue", "");
            String hint = menu.optString("hint", "");
            String previewKind = menu.optString("previewKind", "none");
            JSONObject previewData = menu.optJSONObject("previewData");

            drawMenuTitle(canvas, panel, title, dp(16));

            if (!selectedLabel.isEmpty()) {
                RectF selectedBox = new RectF(panel.left + dp(18), panel.top + dp(56), panel.right - dp(18), panel.top + dp(98));
                drawMenuSelectionBox(canvas, selectedBox);
                drawMenuSelectionText(canvas, selectedBox, selectedLabel, selectedValue);
            }

            if (!description.isEmpty()) {
                drawMenuDescription(canvas, panel, description, panel.top + dp(118), dp(11), dp(14));
            }

            if ("rotate".equals(previewKind) && previewData != null) {
                RectF rotateBox = new RectF(panel.left + dp(18), panel.top + dp(148), panel.right - dp(18), panel.bottom - dp(30));
                drawRotatePreview(canvas, rotateBox, previewData);
            }

            if (!hint.isEmpty()) {
                drawCenteredMenuText(canvas, hint, panel.centerX(), panel.bottom - dp(14), COLOR_TEXT_DIM, dp(11), dp(9), panel.width() - dp(32));
            }
        }

        private void drawSplashMenuScreen(Canvas canvas, RectF panel, JSONObject menu) {
            String title = menu.optString("title", "TETRIS FLIP");
            String prompt = menu.optString("prompt", "PRESS TO START");
            String author = menu.optString("author", "");
            String tagline = menu.optString("tagline", "");
            JSONArray accentPieces = menu.optJSONArray("accentPieces");
            long now = SystemClock.uptimeMillis();
            float phase = (now % 6000L) / 6000f;

            drawMenuTitle(canvas, panel, title, dp(24));
            if (!tagline.isEmpty()) {
                drawCenteredMenuText(canvas, tagline, panel.centerX(), panel.top + dp(56), COLOR_TEXT_SOFT, dp(12), dp(10), panel.width() - dp(36));
            }

            drawSplashAccentPiece(canvas, accentPieces, 0, panel.left + dp(22), panel.top + dp(36) + (float) Math.sin(phase * Math.PI * 2d) * dp(4), dp(10), Color.argb(92, 248, 244, 255));
            drawSplashAccentPiece(canvas, accentPieces, 1, panel.right - dp(82), panel.top + dp(70) + (float) Math.sin((phase + 0.28f) * Math.PI * 2d) * dp(5), dp(11), Color.argb(78, 255, 214, 84));
            drawSplashAccentPiece(canvas, accentPieces, 2, panel.centerX() - dp(24), panel.bottom - dp(88) + (float) Math.sin((phase + 0.61f) * Math.PI * 2d) * dp(4), dp(9), Color.argb(82, 94, 255, 165));

            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.2f));
            paint.setColor(Color.argb(76, 248, 244, 255));
            canvas.drawLine(panel.left + dp(24), panel.centerY() - dp(4), panel.right - dp(24), panel.centerY() - dp(4), paint);

            RectF promptBox = new RectF(panel.left + dp(42), panel.centerY() + dp(14), panel.right - dp(42), panel.centerY() + dp(54));
            drawMenuSelectionBox(canvas, promptBox);
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(fitTextSize(prompt, promptBox.width() - dp(20), dp(18), dp(12), paint.getTypeface()));
            canvas.drawText(prompt, promptBox.centerX(), promptBox.top + dp(26), paint);

            if (!author.isEmpty()) {
                drawCenteredMenuText(canvas, author, panel.centerX(), panel.bottom - dp(18), COLOR_TEXT_DIM, dp(11), dp(9), panel.width() - dp(36));
            }
            paint.setStyle(Paint.Style.FILL);
        }

        private void drawMenuTitle(Canvas canvas, RectF panel, String title, float size) {
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(fitTextSize(title.toUpperCase(Locale.US), panel.width() - dp(40), size, dp(12), paint.getTypeface()));
            canvas.drawText(title.toUpperCase(Locale.US), panel.centerX(), panel.top + dp(18), paint);
        }

        private void drawMenuDescription(Canvas canvas, RectF panel, String description, float startY, float size, float lineHeight) {
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setColor(COLOR_TEXT_SOFT);
            paint.setTextSize(size);
            String[] descriptionLines = description.split("\\n");
            float y = startY;
            for (String line : descriptionLines) {
                if (!line.isEmpty()) {
                    drawCenteredMenuText(canvas, line, panel.centerX(), y, COLOR_TEXT_SOFT, size, dp(9), panel.width() - dp(40));
                }
                y += lineHeight;
            }
        }

        private void drawMenuSelectionBox(Canvas canvas, RectF selectedBox) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(COLOR_MENU_HILITE_BG);
            canvas.drawRect(selectedBox, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.5f));
            paint.setColor(COLOR_MENU_STROKE);
            canvas.drawRect(selectedBox, paint);
            paint.setStrokeWidth(dp(0.9f));
            paint.setColor(COLOR_MENU_INNER_STROKE);
            canvas.drawRect(
                selectedBox.left + dp(3),
                selectedBox.top + dp(3),
                selectedBox.right - dp(3),
                selectedBox.bottom - dp(3),
                paint
            );
            paint.setStyle(Paint.Style.FILL);
        }

        private void drawMenuSelectionText(Canvas canvas, RectF selectedBox, String selected, String detail) {
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setColor(COLOR_TEXT);
            if (!detail.isEmpty()) {
                paint.setTextAlign(Paint.Align.LEFT);
                paint.setTextSize(fitTextSize(selected.toUpperCase(Locale.US), selectedBox.width() * 0.56f, dp(18), dp(12), paint.getTypeface()));
                canvas.drawText(selected.toUpperCase(Locale.US), selectedBox.left + dp(10), selectedBox.top + dp(26), paint);
                paint.setTextAlign(Paint.Align.RIGHT);
                paint.setTextSize(fitTextSize(detail, selectedBox.width() * 0.34f, dp(17), dp(11), paint.getTypeface()));
                canvas.drawText(detail, selectedBox.right - dp(10), selectedBox.top + dp(26), paint);
            } else {
                paint.setTextAlign(Paint.Align.CENTER);
                paint.setTextSize(fitTextSize(selected.toUpperCase(Locale.US), selectedBox.width() - dp(20), dp(18), dp(12), paint.getTypeface()));
                canvas.drawText(selected.toUpperCase(Locale.US), selectedBox.centerX(), selectedBox.top + dp(26), paint);
            }
        }

        private void drawRotatePreview(Canvas canvas, RectF rect, JSONObject previewData) {
            String name = previewData.optString("name", "");
            String badge = previewData.optString("badge", "");
            String cw = previewData.optString("cw", "A");
            String ccw = previewData.optString("ccw", "B");
            String hint = previewData.optString("hint", "");

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(172, 12, 14, 18));
            canvas.drawRect(rect, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.2f));
            paint.setColor(COLOR_MENU_STROKE);
            canvas.drawRect(rect, paint);
            paint.setStyle(Paint.Style.FILL);

            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setColor(COLOR_TEXT_SOFT);
            paint.setTextSize(dp(10));
            canvas.drawText("ROTATE MAP", rect.left + dp(10), rect.top + dp(16), paint);

            if (!badge.isEmpty()) {
                RectF badgeRect = new RectF(rect.right - dp(78), rect.top + dp(6), rect.right - dp(10), rect.top + dp(24));
                drawMenuSelectionBox(canvas, badgeRect);
                paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
                paint.setTextAlign(Paint.Align.CENTER);
                paint.setColor(COLOR_TEXT);
                paint.setTextSize(dp(9));
                canvas.drawText(badge, badgeRect.centerX(), badgeRect.top + dp(12), paint);
            }

            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(dp(18));
            canvas.drawText(name, rect.left + dp(10), rect.top + dp(42), paint);

            float columnTop = rect.top + dp(60);
            float midX = rect.centerX();
            drawRotateColumn(canvas, rect.left + dp(10), columnTop, "CW", cw);
            drawRotateColumn(canvas, midX + dp(6), columnTop, "CCW", ccw);

            if (!hint.isEmpty()) {
                drawCenteredMenuText(canvas, hint, rect.centerX(), rect.bottom - dp(12), COLOR_TEXT_DIM, dp(10), dp(8), rect.width() - dp(20));
            }
        }

        private void drawRotateColumn(Canvas canvas, float x, float y, String label, String value) {
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setColor(COLOR_TEXT_SOFT);
            paint.setTextSize(dp(10));
            canvas.drawText(label, x, y, paint);
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(dp(17));
            canvas.drawText(value, x, y + dp(22), paint);
        }

        private void drawSplashAccentPiece(Canvas canvas, JSONArray accentPieces, int index, float left, float top, float cell, int color) {
            int type = 6;
            if (accentPieces != null && index < accentPieces.length()) {
                type = accentPieces.optInt(index, type);
            }
            int[][] cells = pieceCells(type);
            if (cells.length == 0) return;

            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(Math.max(1f, cell * 0.12f));
            paint.setColor(color);
            for (int[] block : cells) {
                float x = left + block[0] * cell;
                float y = top + block[1] * cell;
                canvas.drawRect(x, y, x + cell, y + cell, paint);
            }
            paint.setStyle(Paint.Style.FILL);
        }

        private void drawCenteredMenuText(Canvas canvas, String text, float x, float y, int color, float preferredSize, float minSize, float maxWidth) {
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setColor(color);
            paint.setTextSize(fitTextSize(text, maxWidth, preferredSize, minSize, paint.getTypeface()));
            canvas.drawText(text, x, y, paint);
        }

        private float fitTextSize(String text, float maxWidth, float preferredSize, float minSize, Typeface typeface) {
            if (text == null || text.isEmpty()) return preferredSize;
            float size = preferredSize;
            paint.setTypeface(typeface);
            paint.setTextSize(size);
            while (size > minSize && paint.measureText(text) > maxWidth) {
                size -= dp(0.5f);
                paint.setTextSize(size);
            }
            return Math.max(size, minSize);
        }

        private void drawPanel(Canvas canvas, RectF rect, boolean strong) {
            float radius = dp(18);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(strong ? COLOR_PANEL_STRONG : COLOR_PANEL);
            canvas.drawRoundRect(rect, radius, radius, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(strong ? dp(2) : dp(1.25f));
            paint.setColor(strong ? COLOR_CYAN_SOFT : COLOR_STROKE);
            canvas.drawRoundRect(rect, radius, radius, paint);
            paint.setStyle(Paint.Style.FILL);
        }

        private void drawScorePanel(Canvas canvas, RectF rect, JSONObject scoreState) {
            float inner = dp(18);
            float x = rect.left + inner;
            float y = rect.top + inner;
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(dp(12));
            canvas.drawText("SCORE", x, y + dp(12), paint);

            paint.setTextSize(dp(34));
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setColor(COLOR_CYAN);
            paint.setShadowLayer(dp(10), 0f, 0f, Color.argb(110, 76, 195, 255));
            canvas.drawText(String.format(Locale.US, "%06d", Math.max(0, intValue(scoreState, "score", 0))), x, y + dp(56), paint);
            paint.clearShadowLayer();

            float statsTop = y + dp(96);
            float columnGap = dp(22);
            float columnWidth = (rect.width() - inner * 2f - columnGap) / 2f;
            drawStatBlock(canvas, x, statsTop, columnWidth, "LEVEL", String.valueOf(intValue(scoreState, "level", 0)));
            drawStatBlock(canvas, x + columnWidth + columnGap, statsTop, columnWidth, "LINES", String.valueOf(intValue(scoreState, "lines", 0)));

            paint.setTypeface(Typeface.MONOSPACE);
            paint.setColor(COLOR_TEXT_SOFT);
            paint.setTextSize(dp(12));
            canvas.drawText("TIME", x, rect.bottom - dp(44), paint);
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(dp(18));
            canvas.drawText(formatHudTime(longValue(scoreState, "timeMs", 0L)), x, rect.bottom - dp(18), paint);
        }

        private void drawStatBlock(Canvas canvas, float x, float y, float width, String label, String value) {
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setColor(COLOR_TEXT_SOFT);
            paint.setTextSize(dp(12));
            canvas.drawText(label, x, y + dp(12), paint);
            paint.setColor(COLOR_TEXT);
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setTextSize(dp(28));
            canvas.drawText(value, x, y + dp(44), paint);
        }

        private void drawQueuePanel(Canvas canvas, RectF rect, JSONObject scoreState, JSONObject queue, JSONObject momentum) {
            float inner = dp(16);
            float holdBoxSize = clamp(rect.width() - inner * 2f, dp(76), dp(100));
            RectF holdBox = new RectF(rect.left + inner, rect.top + inner + dp(22), rect.left + inner + holdBoxSize, rect.top + inner + dp(22) + holdBoxSize);
            drawCaption(canvas, rect.left + inner, rect.top + inner, "HOLD");
            drawPieceFrame(canvas, holdBox);
            drawMonoPiece(canvas, pieceType(queue == null ? null : queue.opt("holdType")), holdBox, dp(16));

            float nextLabelY = holdBox.bottom + dp(20);
            drawCaption(canvas, rect.left + inner, nextLabelY, "NEXT");
            JSONArray nextQueue = queue == null ? null : queue.optJSONArray("nextQueue");
            float nextStartY = nextLabelY + dp(10);
            float nextBoxHeight = dp(24);
            float nextGap = dp(4);
            for (int i = 0; i < 5; i += 1) {
                float top = nextStartY + i * (nextBoxHeight + nextGap);
                RectF nextBox = new RectF(rect.left + inner, top, rect.right - inner, top + nextBoxHeight);
                drawMonoPiece(canvas, nextQueue == null ? -1 : pieceType(nextQueue.opt(i)), nextBox, dp(8));
            }

            float footerTop = rect.bottom - inner - dp(34);
            if (momentum != null) {
                drawCaption(canvas, rect.left + inner, footerTop, "MOMENTUM");
                RectF meter = new RectF(rect.left + inner, footerTop + dp(10), rect.right - inner, footerTop + dp(26));
                drawMeter(canvas, meter, intValue(momentum, "value", 0), intValue(momentum, "max", 100), intValue(momentum, "burstTimer", 0));
            } else {
                drawCaption(canvas, rect.left + inner, footerTop, "TIME");
                paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
                paint.setTextAlign(Paint.Align.LEFT);
                paint.setTextSize(dp(15));
                paint.setColor(COLOR_TEXT);
                canvas.drawText(formatHudTime(longValue(scoreState, "timeMs", 0L)), rect.left + inner, footerTop + dp(26), paint);
            }
        }

        private void drawCoopPanel(Canvas canvas, RectF rect, JSONObject p2Score, JSONObject p2Queue) {
            float inner = dp(16);
            drawRightTitle(canvas, rect, "PLAYER 2");
            float x = rect.left + inner;
            float y = rect.top + inner + dp(28);
            drawRightMetric(canvas, x, y, "SCORE", String.format(Locale.US, "%06d", Math.max(0, intValue(p2Score, "score", 0))), dp(24), COLOR_CYAN);
            y += dp(64);
            drawRightMetric(canvas, x, y, "LEVEL", String.valueOf(intValue(p2Score, "level", 0)), dp(22), COLOR_TEXT);
            y += dp(48);
            drawRightMetric(canvas, x, y, "LINES", String.valueOf(intValue(p2Score, "lines", 0)), dp(22), COLOR_TEXT);

            if (p2Queue != null) {
                float holdTop = rect.bottom - dp(132);
                drawCaption(canvas, x, holdTop, "HOLD");
                RectF holdBox = new RectF(x, holdTop + dp(12), x + dp(64), holdTop + dp(76));
                drawPieceFrame(canvas, holdBox);
                drawMonoPiece(canvas, pieceType(p2Queue.opt("holdType")), holdBox, dp(14));

                drawCaption(canvas, x + dp(92), holdTop, "NEXT");
                JSONArray nextQueue = p2Queue.optJSONArray("nextQueue");
                for (int i = 0; i < 3; i += 1) {
                    RectF nextBox = new RectF(x + dp(92), holdTop + dp(12) + i * dp(22), rect.right - inner, holdTop + dp(34) + i * dp(22));
                    drawMonoPiece(canvas, nextQueue == null ? -1 : pieceType(nextQueue.opt(i)), nextBox, dp(8));
                }
            }
        }

        private void drawGarbagePanel(Canvas canvas, RectF rect, JSONObject garbage) {
            float inner = dp(16);
            float x = rect.left + inner;
            float y = rect.top + inner + dp(28);
            drawRightTitle(canvas, rect, "GARBAGE");
            drawRightMetric(canvas, x, y, "SPEED", String.valueOf(intValue(garbage, "speed", 0)), dp(22), COLOR_TEXT);
            y += dp(46);
            drawRightMetric(canvas, x, y, "HEIGHT", String.valueOf(intValue(garbage, "height", 0)), dp(22), COLOR_TEXT);
            y += dp(46);
            drawRightMetric(canvas, x, y, "TIME", garbage.optString("time", "0:00.0"), dp(22), COLOR_SCORE);
            y += dp(54);
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setColor(COLOR_TEXT_SOFT);
            paint.setTextSize(dp(12));
            canvas.drawText("REMAINING", x, y + dp(12), paint);
            paint.setColor(COLOR_TEXT);
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setTextSize(dp(18));
            canvas.drawText(
                String.format(Locale.US, "%d/%d", intValue(garbage, "remaining", 0), intValue(garbage, "total", 0)),
                x,
                y + dp(36),
                paint
            );
            RectF bar = new RectF(x, y + dp(52), rect.right - inner, y + dp(68));
            int remaining = intValue(garbage, "remaining", 0);
            int total = intValue(garbage, "total", 0);
            float progress = total > 0 ? clamp(1f - (remaining / (float) total), 0f, 1f) : 0f;
            drawProgressBar(canvas, bar, progress, COLOR_WARN);
        }

        private void drawRedemptionPanel(Canvas canvas, RectF rect, JSONObject redemption) {
            float inner = dp(16);
            drawRightTitle(canvas, rect, "REDEMPTION");
            float centerX = rect.centerX();
            float numberY = rect.top + inner + dp(104);
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setColor(COLOR_WARN);
            paint.setTextSize(dp(64));
            paint.setShadowLayer(dp(12), 0f, 0f, Color.argb(90, 255, 154, 107));
            canvas.drawText(String.valueOf(intValue(redemption, "lives", 0)), centerX, numberY, paint);
            paint.clearShadowLayer();
            paint.setColor(COLOR_TEXT_SOFT);
            paint.setTextSize(dp(14));
            canvas.drawText("LIVES", centerX, numberY + dp(28), paint);
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(dp(18));
            canvas.drawText("MAX " + intValue(redemption, "maxLives", 0), centerX, numberY + dp(64), paint);
        }

        private void drawRunPanel(Canvas canvas, RectF rect, JSONObject runStats) {
            float inner = dp(16);
            float x = rect.left + inner;
            float y = rect.top + inner + dp(28);
            drawRightTitle(canvas, rect, "RUN");
            JSONArray counts = runStats == null ? null : runStats.optJSONArray("counts");
            float rowHeight = dp(24);
            for (int type : PIECE_TYPES) {
                drawPieceCountRow(canvas, x, y, rect.right - inner, rowHeight, type, counts == null ? 0 : counts.optInt(type, 0));
                y += rowHeight;
            }
            float summaryTop = rect.bottom - inner - dp(54);
            drawCaption(canvas, x, summaryTop, "I DROUGHT");
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setTextSize(dp(20));
            paint.setColor(COLOR_TEXT);
            canvas.drawText(String.valueOf(intValue(runStats, "droughtI", 0)), x, summaryTop + dp(24), paint);
            paint.setTextAlign(Paint.Align.RIGHT);
            drawCaptionAligned(canvas, rect.right - inner, summaryTop, "TOTAL", Paint.Align.RIGHT);
            paint.setTextAlign(Paint.Align.RIGHT);
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setTextSize(dp(20));
            paint.setColor(COLOR_TEXT);
            canvas.drawText(String.valueOf(intValue(runStats, "total", 0)), rect.right - inner, summaryTop + dp(24), paint);
        }

        private void drawFallbackPanel(Canvas canvas, RectF rect, String modeText, JSONObject scoreState, JSONObject momentum) {
            float inner = dp(16);
            float x = rect.left + inner;
            float y = rect.top + inner + dp(28);
            drawRightTitle(canvas, rect, modeText);
            drawRightMetric(canvas, x, y, "TIME", formatHudTime(longValue(scoreState, "timeMs", 0L)), dp(24), COLOR_SCORE);
            y += dp(60);
            if (momentum != null) {
                drawRightMetric(canvas, x, y, "BURST", intValue(momentum, "value", 0) + "/" + intValue(momentum, "max", 100), dp(20), COLOR_TEXT);
                RectF meter = new RectF(x, y + dp(26), rect.right - inner, y + dp(44));
                drawMeter(canvas, meter, intValue(momentum, "value", 0), intValue(momentum, "max", 100), intValue(momentum, "burstTimer", 0));
            } else {
                paint.setTypeface(Typeface.MONOSPACE);
                paint.setTextAlign(Paint.Align.LEFT);
                paint.setColor(COLOR_TEXT_SOFT);
                paint.setTextSize(dp(12));
                canvas.drawText("SECONDARY HUD", x, y + dp(12), paint);
                paint.setColor(COLOR_TEXT);
                paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
                paint.setTextSize(dp(18));
                canvas.drawText("INFO MODE ACTIVE", x, y + dp(40), paint);
            }
        }

        private void drawRightTitle(Canvas canvas, RectF rect, String title) {
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(dp(14));
            canvas.drawText(title, rect.left + dp(16), rect.top + dp(28), paint);
        }

        private void drawRightMetric(Canvas canvas, float x, float y, String label, String value, float valueSize, int valueColor) {
            drawCaption(canvas, x, y, label);
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setColor(valueColor);
            paint.setTextSize(valueSize);
            canvas.drawText(value, x, y + dp(28), paint);
        }

        private void drawCaption(Canvas canvas, float x, float y, String label) {
            drawCaptionAligned(canvas, x, y, label, Paint.Align.LEFT);
        }

        private void drawCaptionAligned(Canvas canvas, float x, float y, String label, Paint.Align align) {
            paint.setTypeface(Typeface.MONOSPACE);
            paint.setTextAlign(align);
            paint.setColor(COLOR_TEXT_SOFT);
            paint.setTextSize(dp(12));
            canvas.drawText(label, x, y + dp(12), paint);
        }

        private void drawPieceCountRow(Canvas canvas, float left, float top, float right, float height, int type, int count) {
            RectF iconBox = new RectF(left, top, left + dp(54), top + height);
            drawMonoPiece(canvas, type, iconBox, dp(7));
            paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
            paint.setTextAlign(Paint.Align.RIGHT);
            paint.setColor(COLOR_TEXT);
            paint.setTextSize(dp(16));
            canvas.drawText(String.valueOf(count), right, top + height - dp(5), paint);
        }

        private void drawPieceFrame(Canvas canvas, RectF rect) {
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.5f));
            paint.setColor(COLOR_STROKE_STRONG);
            canvas.drawRoundRect(rect, dp(10), dp(10), paint);
            paint.setStyle(Paint.Style.FILL);
        }

        private void drawMonoPiece(Canvas canvas, int type, RectF box, float maxCell) {
            int[][] cells = pieceCells(type);
            if (cells.length == 0) return;
            int minX = Integer.MAX_VALUE;
            int minY = Integer.MAX_VALUE;
            int maxX = Integer.MIN_VALUE;
            int maxY = Integer.MIN_VALUE;
            for (int[] block : cells) {
                minX = Math.min(minX, block[0]);
                minY = Math.min(minY, block[1]);
                maxX = Math.max(maxX, block[0]);
                maxY = Math.max(maxY, block[1]);
            }
            float pieceWidth = maxX - minX + 1f;
            float pieceHeight = maxY - minY + 1f;
            float cell = Math.min(maxCell, Math.min(box.width() / Math.max(1f, pieceWidth), box.height() / Math.max(1f, pieceHeight)));
            cell = Math.max(dp(5), cell);
            float offsetX = box.left + (box.width() - pieceWidth * cell) / 2f;
            float offsetY = box.top + (box.height() - pieceHeight * cell) / 2f;

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(COLOR_MONO_FILL);
            for (int[] block : cells) {
                float x = offsetX + (block[0] - minX) * cell;
                float y = offsetY + (block[1] - minY) * cell;
                RectF rect = new RectF(x, y, x + cell, y + cell);
                canvas.drawRoundRect(rect, cell * 0.18f, cell * 0.18f, paint);
            }
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(Math.max(1f, cell * 0.11f));
            paint.setColor(COLOR_MONO_STROKE);
            for (int[] block : cells) {
                float x = offsetX + (block[0] - minX) * cell;
                float y = offsetY + (block[1] - minY) * cell;
                RectF rect = new RectF(x, y, x + cell, y + cell);
                canvas.drawRoundRect(rect, cell * 0.18f, cell * 0.18f, paint);
            }
            paint.setStyle(Paint.Style.FILL);
        }

        private void drawMeter(Canvas canvas, RectF rect, int value, int max, int burstTimer) {
            float pct = max > 0 ? clamp(value / (float) max, 0f, 1f) : 0f;
            int fillColor = COLOR_CYAN;
            if (pct >= 0.75f) {
                fillColor = Color.rgb(255, 107, 90);
            } else if (pct >= 0.5f) {
                fillColor = COLOR_SCORE;
            } else if (pct >= 0.25f) {
                fillColor = COLOR_OK;
            }
            if (burstTimer > 0) {
                fillColor = COLOR_WARN;
            }

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(110, 0, 0, 0));
            canvas.drawRoundRect(rect, dp(8), dp(8), paint);
            RectF fill = new RectF(rect.left + dp(2), rect.top + dp(2), rect.left + dp(2) + (rect.width() - dp(4)) * pct, rect.bottom - dp(2));
            paint.setColor(fillColor);
            canvas.drawRoundRect(fill, dp(6), dp(6), paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.25f));
            paint.setColor(COLOR_STROKE_STRONG);
            canvas.drawRoundRect(rect, dp(8), dp(8), paint);
            paint.setStyle(Paint.Style.FILL);
        }

        private void drawProgressBar(Canvas canvas, RectF rect, float progress, int fillColor) {
            float pct = clamp(progress, 0f, 1f);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(110, 0, 0, 0));
            canvas.drawRoundRect(rect, dp(8), dp(8), paint);
            RectF fill = new RectF(rect.left + dp(2), rect.top + dp(2), rect.left + dp(2) + (rect.width() - dp(4)) * pct, rect.bottom - dp(2));
            paint.setColor(fillColor);
            canvas.drawRoundRect(fill, dp(6), dp(6), paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.25f));
            paint.setColor(COLOR_STROKE_STRONG);
            canvas.drawRoundRect(rect, dp(8), dp(8), paint);
            paint.setStyle(Paint.Style.FILL);
        }

        private float dp(float value) {
            return value * getResources().getDisplayMetrics().density;
        }
    }

    static class GameBoardView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private JSONObject board;
        private JSONObject score;
        private String modeLabel = "Marathon";
        private String status = "Playing";
        private JSONArray cachedColors = null;

        // Fast-path bridge fields
        private String cellsString = null;
        private int scoreValue = 0;
        private int level = 0;
        private int lines = 0;
        private boolean isFlipped = false;
        private float customCellSize = 0f;
        private float customGridLeft = 0f;
        private float customGridTop = 0f;
        private float customViewportW = 0f;

        GameBoardView(Context context) {
            super(context);
        }

        void update(JSONObject board, JSONObject score, String modeLabel, String status) {
            update(board, score, modeLabel, status, 0f, 0f, 0f, 0f);
        }

        void update(JSONObject board, JSONObject score, String modeLabel, String status, float cellSize, float gridLeft, float gridTop) {
            update(board, score, modeLabel, status, cellSize, gridLeft, gridTop, 0f);
        }

        void update(JSONObject board, JSONObject score, String modeLabel, String status, float cellSize, float gridLeft, float gridTop, float viewportW) {
            this.board = board;
            this.score = score;
            this.modeLabel = modeLabel == null ? "Marathon" : modeLabel;
            this.status = status == null ? "Playing" : status;
            this.cellsString = null; // Clear the direct fast-path cache
            this.customCellSize = cellSize;
            this.customGridLeft = gridLeft;
            this.customGridTop = gridTop;
            this.customViewportW = viewportW;
            if (board != null) {
                this.cachedColors = board.optJSONArray("colors");
            }
            invalidate();
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped) {
            pushFrame(cells, score, level, lines, status, isFlipped, 0f, 0f, 0f, 0f);
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped, float cellSize, float gridLeft, float gridTop) {
            pushFrame(cells, score, level, lines, status, isFlipped, cellSize, gridLeft, gridTop, 0f);
        }

        void pushFrame(String cells, int score, int level, int lines, String status, boolean isFlipped, float cellSize, float gridLeft, float gridTop, float viewportW) {
            this.cellsString = cells;
            this.scoreValue = score;
            this.level = level;
            this.lines = lines;
            this.status = status == null ? "Playing" : status;
            this.isFlipped = isFlipped;
            this.customCellSize = cellSize;
            this.customGridLeft = gridLeft;
            this.customGridTop = gridTop;
            this.customViewportW = viewportW;
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int width = getWidth();
            int height = getHeight();
            canvas.drawColor(COLOR_BG);

            if (cellsString == null && board == null) {
                paint.setTypeface(Typeface.MONOSPACE);
                paint.setTextAlign(Paint.Align.CENTER);
                paint.setTextSize(dp(22));
                paint.setColor(COLOR_TEXT);
                canvas.drawText("Waiting for board", width / 2f, height / 2f, paint);
                return;
            }

            int cols = 10;
            int rows = 20;
            if (cellsString == null && board != null) {
                cols = Math.max(1, board.optInt("cols", 10));
                rows = Math.max(1, board.optInt("rows", 20));
            }

            float density = getResources().getDisplayMetrics().density;
            float cellSize = Math.min((float) width / cols, (float) height / rows);
            float left;
            float boardTop;

            if (customViewportW > 0f) {
                float leftOffset = (customViewportW * density - width) / 2f;
                float topCellSizePhys = customCellSize * density;
                float centerAlignShift = cols * (topCellSizePhys - cellSize) / 2f;
                float fineTuneShift = 0f;
                left = customGridLeft * density - leftOffset + centerAlignShift + fineTuneShift;
                boardTop = (height - (cellSize * rows)) / 2f;
            } else {
                left = (width - cellSize * cols) / 2f;
                boardTop = (height - cellSize * rows) / 2f;
            }
            float gridWidth = cellSize * cols;
            float gridHeight = cellSize * rows;

            // Draw continuous grid lines (matching top screen style)
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(1f);
            paint.setColor(Color.argb(20, 255, 255, 255)); // rgba(255,255,255,0.08)
            for (int x = 0; x <= cols; x++) {
                float px = left + x * cellSize;
                canvas.drawLine(px, boardTop, px, boardTop + gridHeight, paint);
            }
            for (int y = 0; y <= rows; y++) {
                float py = boardTop + y * cellSize;
                canvas.drawLine(left, py, left + gridWidth, py, paint);
            }

            JSONArray cellsJson = (cellsString == null && board != null) ? board.optJSONArray("cells") : null;

            for (int y = 0; y < rows; y += 1) {
                JSONArray row = cellsJson == null ? null : cellsJson.optJSONArray(y);
                for (int x = 0; x < cols; x += 1) {
                    int value = 0;
                    if (cellsString != null) {
                        int idx = y * cols + x;
                        if (idx < cellsString.length()) {
                            value = Character.digit(cellsString.charAt(idx), 36);
                            if (value < 0) value = 0;
                        }
                    } else if (row != null) {
                        value = row.optInt(x, 0);
                    }

                    float x0 = left + x * cellSize;
                    float y0 = boardTop + y * cellSize;

                    if (value > 0) {
                        if (value >= 11 && value <= 17) {
                            // Render ghost block outline and fill matching top screen
                            int baseColor = pieceColor(cachedColors, value - 10);
                            int fillCol = Color.argb(41, Color.red(baseColor), Color.green(baseColor), Color.blue(baseColor)); // 0.16 * 255 = 40.8 -> 41
                            int strokeCol = Color.argb(143, 220, 220, 220); // 0.8 * 0.7 = 0.56 * 255 = 142.8 -> 143

                            float strokeWidth = Math.max(1f, cellSize * (2.5f / 30f));
                            float fillInset = Math.max(1f, cellSize * (2f / 30f));
                            float strokeInset = Math.max(0.5f, cellSize * (1f / 30f));

                            paint.setStyle(Paint.Style.FILL);
                            paint.setColor(fillCol);
                            canvas.drawRect(x0 + fillInset, y0 + fillInset, x0 + cellSize - fillInset, y0 + cellSize - fillInset, paint);

                            paint.setStyle(Paint.Style.STROKE);
                            paint.setStrokeWidth(strokeWidth);
                            paint.setColor(strokeCol);
                            paint.setShadowLayer(dp(2.5f), 0, 0, Color.argb(115, 220, 220, 220));
                            canvas.drawRect(x0 + strokeInset, y0 + strokeInset, x0 + cellSize - strokeInset, y0 + cellSize - strokeInset, paint);
                            paint.clearShadowLayer();
                        } else if (value >= 21 && value <= 27) {
                            int color = pieceColor(cachedColors, value - 20);
                            drawCellJava(canvas, x0, y0, cellSize, color, 1.0f);
                        } else {
                            int color = pieceColor(cachedColors, value);
                            drawCellJava(canvas, x0, y0, cellSize, color, 1.0f);
                        }
                    }
                }
            }
        }

        private void drawCellJava(Canvas canvas, float x0, float y0, float cellSize, int color, float alpha) {
            int argbColor;
            if (alpha < 1f) {
                argbColor = Color.argb((int)(alpha * 255), Color.red(color), Color.green(color), Color.blue(color));
            } else {
                argbColor = color;
            }

            // 1. Fill base block
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(argbColor);
            canvas.drawRect(x0, y0, x0 + cellSize, y0 + cellSize, paint);

            // 2. Highlighting border: rgba(255, 255, 255, 0.7) stroke rect of width 3px
            float strokeWidth3 = Math.max(1f, cellSize * (3f / 30f));
            float strokeWidth1 = Math.max(1f, cellSize * (1f / 30f));

            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(strokeWidth3);
            paint.setColor(Color.argb((int)(alpha * 178), 255, 255, 255)); // 0.7 * 255 = 178.5
            float inset3 = strokeWidth3 * 0.5f + Math.max(0.5f, cellSize * (1f / 30f));
            canvas.drawRect(x0 + inset3, y0 + inset3, x0 + cellSize - inset3, y0 + cellSize - inset3, paint);

            // 3. Draw upper-left bevel highlight: rgba(255, 255, 255, 0.28)
            paint.setStrokeWidth(strokeWidth1);
            paint.setColor(Color.argb((int)(alpha * 71), 255, 255, 255)); // 0.28 * 255 = 71.4
            float offset2 = strokeWidth3 + strokeWidth1 * 0.5f;
            // Horizontal line
            canvas.drawLine(x0 + offset2, y0 + offset2, x0 + cellSize - offset2, y0 + offset2, paint);
            // Vertical line
            canvas.drawLine(x0 + offset2, y0 + offset2, x0 + offset2, y0 + cellSize - offset2, paint);

            // 4. Draw diagonal reflection line: rgba(255, 255, 255, 0.22)
            paint.setColor(Color.argb((int)(alpha * 56), 255, 255, 255)); // 0.22 * 255 = 56.1
            float offset3 = offset2 + strokeWidth1;
            canvas.drawLine(x0 + offset3, y0 + cellSize - offset3 - strokeWidth1, x0 + cellSize - offset3 - strokeWidth1, y0 + offset3, paint);

            // 5. Soft inner overlay fill: rgba(255, 255, 255, 0.08)
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb((int)(alpha * 20), 255, 255, 255)); // 0.08 * 255 = 20.4
            float inset6 = offset3;
            canvas.drawRect(x0 + inset6, y0 + inset6, x0 + cellSize - inset6, y0 + cellSize - inset6, paint);
        }

        private float dp(float value) {
            return value * getResources().getDisplayMetrics().density;
        }
    }
}
