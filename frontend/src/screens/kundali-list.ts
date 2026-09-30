/**
 * Kundali List Screen
 * Manage user's birth charts (create, view, delete)
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { listKundalis, deleteKundali } from "../api";

export async function renderKundaliList(): Promise<void> {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>My Kundalis</h2>
        <button class="btn btn-small" id="btn-add">+ Add New</button>
      </header>

      <div class="kundali-list">
        <div id="loading" class="text-center" style="padding: var(--space-6);">
          <div class="spinner"></div>
          <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">Loading kundalis...</p>
        </div>
        <div id="list" style="display: none;"></div>
        <div id="empty" style="display: none; text-align: center; padding: var(--space-8);">
          <p style="font-size: var(--font-size-lg); color: var(--color-text-secondary); margin-bottom: var(--space-4);">
            No kundalis yet
          </p>
          <button class="btn btn-primary" id="btn-add-empty">Create First Kundali</button>
        </div>
      </div>
    </div>
  `;

  // Event handlers
  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/dashboard"));
  const btnAdd = document.getElementById("btn-add")!;
  const btnAddEmpty = document.getElementById("btn-add-empty");

  btnAdd.addEventListener("click", () => navigate("/kundali-form"));
  if (btnAddEmpty) {
    btnAddEmpty.addEventListener("click", () => navigate("/kundali-form"));
  }

  // Load kundalis
  try {
    const res = await listKundalis();

    const loading = document.getElementById("loading")!;
    const list = document.getElementById("list")!;
    const empty = document.getElementById("empty")!;
    const kundalis = (res.ok && Array.isArray(res.data?.kundalis)) ? res.data.kundalis : [];

    loading.style.display = "none";

    if (kundalis.length === 0) {
      empty.style.display = "block";
    } else {
      list.style.display = "block";
      renderKundaliItems(list, kundalis);
    }
  } catch (error) {
    console.error("Failed to load kundalis:", error);
    showToast("Failed to load kundalis", true);
  }
}

function renderKundaliItems(container: HTMLElement, kundalis: any[]): void {
  container.innerHTML = kundalis
    .map(
      (k) => `
    <div class="kundali-item" data-id="${k.id}">
      <div class="kundali-info">
        <h3>${k.label || "Unnamed Kundali"}</h3>
        <p>
          ${new Date(k.birth_date).toLocaleDateString('en-IN')}
          ${k.birth_time ? ` at ${k.birth_time}` : ""}
        </p>
      </div>
      <div class="kundali-actions">
        <button class="btn btn-secondary btn-small view-btn" data-id="${k.id}">
          View Chart
        </button>
        <button class="btn btn-danger btn-small delete-btn" data-id="${k.id}">
          Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // View Chart button → Birth Chart screen (V6 Phase 1)
  container.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = (e.target as HTMLElement).dataset.id;
      if (id) navigate(`/birth-chart?id=${id}`);
    });
  });

  // Delete button: confirm + delete
  container.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = (e.target as HTMLElement).dataset.id;
      const item = container.querySelector(`[data-id="${id}"]`) as HTMLElement;
      const name = item?.querySelector("h3")?.textContent || "this kundali";

      if (confirm(`Delete ${name}? This cannot be undone.`)) {
        try {
          const res = await deleteKundali(Number(id));
          if (res.ok) {
            showToast("Kundali deleted");
            item?.remove();

            // Check if list is now empty
            const remaining = container.querySelectorAll(".kundali-item");
            if (remaining.length === 0) {
              container.style.display = "none";
              document.getElementById("empty")!.style.display = "block";
            }
          } else {
            showToast(res.data?.error ?? "Failed to delete kundali", true);
          }
        } catch (error) {
          console.error("Delete error:", error);
          showToast("Error deleting kundali", true);
        }
      }
    });
  });
}
