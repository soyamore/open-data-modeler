// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useJsonIO(diagram: any) {
  // Export: trigger browser download
  function downloadJSON() {
    const blob = new Blob([diagram.exportJSON()], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'diagram.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import: open file picker, read, parse
  function openJSON(): Promise<{ ok: boolean; error?: string }> {
    return new Promise(resolve => {
      const input    = document.createElement('input')
      input.type     = 'file'
      input.accept   = '.json,application/json'
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) return resolve({ ok: false, error: 'No file selected' })
        const reader = new FileReader()
        reader.onload = () => {
          const result = diagram.importJSON(reader.result as string)
          resolve(result)
        }
        reader.onerror = () => resolve({ ok: false, error: 'File read error' })
        reader.readAsText(file)
      }
      input.click()
    })
  }

  return { downloadJSON, openJSON }
}
