// ============================================================
// TONDE DESKTOP — lib.rs
// Configuration Tauri + enregistrement des Commands
// Sprint 0 : commandes de base + plugins
// ============================================================

mod commands;

use commands::storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ── Plugins ──
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        // ── Commands ──
        .invoke_handler(tauri::generate_handler![
            // Storage sécurisé JWT
            storage::secure_set_token,
            storage::secure_get_token,
            storage::secure_clear_token,
            // Health check
            ping,
        ])
        .run(tauri::generate_context!())
        .expect("Erreur au démarrage de l'application TONDE");
}

/// Health check simple
#[tauri::command]
fn ping() -> &'static str {
    "pong"
}
