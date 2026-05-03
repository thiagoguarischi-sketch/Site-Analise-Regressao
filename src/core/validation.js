// Parsing/validação de entrada de dados (CSV bruto e arquivos via FileReader).

export function parseCSVText(text) {
  text = text.replace(/^﻿/, '');
  return text.trim().split(/\r?\n/).map(l => l.split(/[,;|\t]/));
}

export function readFileAsArray(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error('Arquivo vazio.')); return; }
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    if (ext === 'csv') {
      reader.onload = e => {
        try { resolve(parseCSVText(e.target.result)); }
        catch (err) { reject(err); }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    } else {
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          resolve(XLSX.utils.sheet_to_json(ws, { header: 1 }));
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    }
  });
}
