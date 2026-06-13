// ============================================================
// TONDE DESKTOP — Command : storage.rs
// Stockage sécurisé du JWT via Tauri Plugin Store
// Le token n'est JAMAIS dans le localStorage (règle absolue)
// ============================================================

use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "tonde-secure.json";
const TOKEN_KEY: &str = "access_token";

/// Sauvegarde le JWT dans le store sécurisé Tauri
#[tauri::command]
pub async fn secure_set_token(
    app: AppHandle,
    token: String,
) -> Result<(), String> {
    let store = app
        .store(STORE_PATH)
        .map_err(|e| format!("Store error: {e}"))?;

    store
        .set(TOKEN_KEY, serde_json::Value::String(token));

    store
        .save()
        .map_err(|e| format!("Save error: {e}"))?;

    Ok(())
}

/// Récupère le JWT depuis le store sécurisé Tauri
#[tauri::command]
pub async fn secure_get_token(app: AppHandle) -> Result<Option<String>, String> {
    let store = app
        .store(STORE_PATH)
        .map_err(|e| format!("Store error: {e}"))?;

    let token = store
        .get(TOKEN_KEY)
        .and_then(|v| v.as_str().map(|s| s.to_owned()));

    Ok(token)
}

/// Supprime le JWT du store (logout)
#[tauri::command]
pub async fn secure_clear_token(app: AppHandle) -> Result<(), String> {
    let store = app
        .store(STORE_PATH)
        .map_err(|e| format!("Store error: {e}"))?;

    store.delete(TOKEN_KEY);

    store
        .save()
        .map_err(|e| format!("Save error: {e}"))?;

    Ok(())
}
