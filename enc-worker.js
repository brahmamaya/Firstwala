/* JPEG encoder worker for the PDF export: draws a page bitmap on an OffscreenCanvas and encodes it away from the page thread. */
self.onmessage = async e => {
  const { id, bmp, q } = e.data;
  try {
    const oc = new OffscreenCanvas(bmp.width, bmp.height);
    oc.getContext('2d').drawImage(bmp, 0, 0); bmp.close?.();
    const buf = await (await oc.convertToBlob({ type: 'image/jpeg', quality: q })).arrayBuffer();
    self.postMessage({ id, buf }, [buf]);
  } catch { self.postMessage({ id, err: 1 }); }
};
