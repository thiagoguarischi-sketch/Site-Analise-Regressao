// Operações matriciais em JS puro — multiplicação, transposta e inversão (Gauss-Jordan).

export function matMul(A, B) {
  const m = A.length, n = B[0].length, p = B.length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      Array.from({ length: p }, (_, k) => A[i][k] * B[k][j]).reduce((s, v) => s + v, 0)
    )
  );
}

export function matT(A) {
  return A[0].map((_, j) => A.map(r => r[j]));
}

export function matInv(M) {
  const n = M.length;
  const A = M.map(r => [...r]);
  const I = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => +(i === j)));
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row;
    }
    [A[col], A[maxRow]] = [A[maxRow], A[col]];
    [I[col], I[maxRow]] = [I[maxRow], I[col]];
    const pivot = A[col][col];
    if (Math.abs(pivot) < 1e-12) return null;
    for (let j = 0; j < n; j++) { A[col][j] /= pivot; I[col][j] /= pivot; }
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const f = A[row][col];
      for (let j = 0; j < n; j++) { A[row][j] -= f * A[col][j]; I[row][j] -= f * I[col][j]; }
    }
  }
  return I;
}

// Log-determinant via Cholesky decomposition: log|M| = 2·Σ log(L_ii)
export function matLogDet(M) {
  const n = M.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = M[i][j];
      for (let r = 0; r < j; r++) s -= L[i][r] * L[j][r];
      if (i === j) {
        if (s <= 0) return Infinity;
        L[i][j] = Math.sqrt(s);
      } else {
        L[i][j] = s / L[j][j];
      }
    }
  }
  let logDet = 0;
  for (let i = 0; i < n; i++) logDet += Math.log(L[i][i]);
  return 2 * logDet;
}
