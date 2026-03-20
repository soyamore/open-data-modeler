import { ref } from 'vue'

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s   = document.createElement('script')
    s.src     = src
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load: ${src}`))
    document.head.appendChild(s)
  })
}

export function useExport() {
  const exporting = ref(false)

  async function exportPNG(el: HTMLElement) {
    exporting.value = true
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      const canvas = await (window as any).html2canvas(el, {
        backgroundColor: '#f0f4f8', scale: 2, useCORS: true, logging: false,
      })
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'schema.png'
      a.click()
    } finally { exporting.value = false }
  }

  async function exportPDF(el: HTMLElement) {
    exporting.value = true
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      const canvas  = await (window as any).html2canvas(el, {
        backgroundColor: '#f0f4f8', scale: 2, useCORS: true, logging: false,
      })
      const imgData  = canvas.toDataURL('image/png')
      const { jsPDF } = (window as any).jspdf
      const w = canvas.width / 2
      const h = canvas.height / 2
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'px', format: [w, h],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
      pdf.save('schema.pdf')
    } finally { exporting.value = false }
  }

  return { exporting, exportPNG, exportPDF }
}
