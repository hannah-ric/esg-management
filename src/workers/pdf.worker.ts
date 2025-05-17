// src/workers/pdf.worker.ts
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas'; // Unused
import * as htmlToImage from 'html-to-image';

interface PDFWorkerMessage {
  action: 'generatePdf';
  htmlString: string; // Instead of elementId, pass the HTML string directly
  filename: string;
}

declare let self: DedicatedWorkerGlobalScope;
export {}; // Ensure this is treated as a module

// Define constants for default image dimensions if an image fails to load
// const FAKE_IMG_WIDTH_IF_ERROR = 100; // Unused
// const FAKE_IMG_HEIGHT_IF_ERROR = 100; // Unused

self.onmessage = async (event: MessageEvent<PDFWorkerMessage>) => {
  const { action, htmlString, filename } = event.data;

  if (action === 'generatePdf') {
    try {
      // Create a temporary element in the worker's context to render HTML
      // This is a simplified approach; complex CSS might not render perfectly.
      // OffscreenCanvas might be an option for more robust rendering if supported and applicable.
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px'; // Position off-screen
      tempElement.style.width = '1024px'; // Define a reasonable width for rendering
      tempElement.innerHTML = htmlString;
      document.body.appendChild(tempElement);

      // Get dimensions for accurate capture
      const elementWidth = tempElement.scrollWidth || 1024;
      const elementHeight = tempElement.scrollHeight || 768;

      const imgData = await htmlToImage.toPng(tempElement, {
        quality: 0.95, // Default is 0.92
        // It's important to set canvasWidth and canvasHeight if the element's
        // dimensions might be computed based on viewport or parent, which is tricky in a worker.
        // However, html-to-image tries to capture the element as is.
        // We will use the appended element's scrollWidth and scrollHeight.
        // Ensure the element is fully rendered before capture.
        // Adding a small delay or check might be needed if content loads async within the HTML string.
         width: elementWidth,
         height: elementHeight,
         style: {
           // Ensure the off-screen element is rendered as if it were on-screen
           // This might not be necessary if the element's styles are self-contained
           // and don't rely heavily on viewport-relative units for its core layout.
         }
      });
      
      document.body.removeChild(tempElement); // Clean up

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      // To get image dimensions from data URL, we need to load it into an Image object
      // const FAKE_IMG_WIDTH_IF_ERROR = elementWidth * 2; // Assuming scale of 2 like html2canvas had
      // const FAKE_IMG_HEIGHT_IF_ERROR = elementHeight * 2;

      const loadImage = (url: string): Promise<HTMLImageElement> => 
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });

      let imgForDimensions: HTMLImageElement;
      let actualImgWidth: number;
      let actualImgHeight: number;

      try {
        imgForDimensions = await loadImage(imgData);
        actualImgWidth = imgForDimensions.width;
        actualImgHeight = imgForDimensions.height;
      } catch (e) {
        console.error("Error loading image for dimensions:", e);
        self.postMessage({ success: false, error: "Failed to load generated image for PDF processing.", filename });
        return;
        // Fallback if loading the image for dimensions fails (e.g., in some worker contexts)
        // This might not be perfectly accurate if htmlToImage applied internal scaling different from 2.
        // actualImgWidth = FAKE_IMG_WIDTH_IF_ERROR; 
        // actualImgHeight = FAKE_IMG_HEIGHT_IF_ERROR;
      }
      
      const imageScaleRatio = pdfPageWidth / actualImgWidth;
      const totalScaledImageHeight = actualImgHeight * imageScaleRatio;
      const numPages = Math.ceil(totalScaledImageHeight / pdfPageHeight);

      let currentSourceY = 0; // Current Y position in the source image (pixels)

      for (let i = 0; i < numPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        let sourceSliceHeight = pdfPageHeight / imageScaleRatio;
        if (currentSourceY + sourceSliceHeight > actualImgHeight) {
          sourceSliceHeight = actualImgHeight - currentSourceY;
        }

        const heightOnPage = sourceSliceHeight * imageScaleRatio;

        // Create a temporary canvas for this page's slice
        const pageCanvas = document.createElement('canvas');
        // Set canvas dimensions to the *source* slice dimensions to avoid distortion before scaling by jsPDF
        pageCanvas.width = actualImgWidth; 
        pageCanvas.height = sourceSliceHeight;
        const ctx = pageCanvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(
            imgForDimensions, // source image
            0,                // sx (source x)
            currentSourceY,   // sy (source y)
            actualImgWidth,   // sWidth (source width)
            sourceSliceHeight,// sHeight (source height)
            0,                // dx (destination x on pageCanvas)
            0,                // dy (destination y on pageCanvas)
            actualImgWidth,   // dWidth (destination width on pageCanvas)
            sourceSliceHeight // dHeight (destination height on pageCanvas)
          );
          // Add the pageCanvas to the PDF. jsPDF will scale it.
          pdf.addImage(pageCanvas, 'CANVAS', 0, 0, pdfPageWidth, heightOnPage);
        } else {
          console.error("Failed to get 2D context for page canvas in PDF worker");
          // Fallback or error handling if canvas context cannot be created
          // Potentially try to add the full image without slicing for this page, or send error.
        }

        currentSourceY += sourceSliceHeight;
      }
      
      const pdfBlob = pdf.output('blob');

      self.postMessage({ success: true, filename, pdfBlob });
    } catch (error) {
      console.error("Error in PDF worker:", error);
      let errorMessage = "An unexpected error occurred while generating the PDF.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      self.postMessage({ success: false, error: errorMessage, filename });
    }
  }
}; 