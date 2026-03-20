import { ref } from 'vue'
import { toRaw } from 'vue'
import type { SavedProject, DiagramSnapshot } from '~/types'

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(toRaw(val) as T))
}

const STORAGE_KEY = 'odm_projects'

function loadProjects(): SavedProject[] {
  if (!import.meta.client) return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function saveProjects(projects: SavedProject[]) {
  if (!import.meta.client) return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)) } catch {}
}

export function useProjects() {
  const projects = ref<SavedProject[]>(loadProjects())

  function saveProject(id: string | null, name: string, snapshot: DiagramSnapshot): SavedProject {
    const pid      = id ?? `p_${Date.now()}`
    const existing = projects.value.findIndex(p => p.id === pid)
    const project: SavedProject = { id: pid, name, updatedAt: Date.now(), snapshot: deepClone(snapshot) }
    if (existing >= 0) projects.value[existing] = project
    else               projects.value.unshift(project)
    saveProjects(projects.value)
    return project
  }

  function deleteProject(id: string) {
    projects.value = projects.value.filter(p => p.id !== id)
    saveProjects(projects.value)
  }

  function renameProject(id: string, name: string) {
    const p = projects.value.find(p => p.id === id)
    if (p) { p.name = name; p.updatedAt = Date.now(); saveProjects(projects.value) }
  }

  function getProject(id: string): SavedProject | undefined {
    return projects.value.find(p => p.id === id)
  }

  return { projects, saveProject, deleteProject, renameProject, getProject }
}
