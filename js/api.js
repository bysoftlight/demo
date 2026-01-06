async function callApi(action, payload = {}) {
    if (!CONFIG.API_URL || !CONFIG.API_SECRET) {
        console.error("Config missing");
        return { success: false, message: "Configuration Error" };
    }

    try {
        const bodyData = JSON.stringify({
            action: action,
            secret: CONFIG.API_SECRET,
            ...payload
        });

        const response = await fetch(CONFIG.API_URL, {
            method: "POST",
            body: bodyData
        });

        return await response.json();
    } catch (error) {
        console.error("Connection Error:", error);
        return { success: false, message: "การเชื่อมต่อขัดข้อง กรุณาตรวจสอบอินเทอร์เน็ต" };
    }
}

const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const maxWidth = 1024;
        const quality = 0.6;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            if (event.target?.result) {
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height *= maxWidth / width));
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxWidth) {
                            width = Math.round((width *= maxWidth / height));
                            height = maxWidth;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
                    } else {
                        reject(new Error("Canvas context is null"));
                    }
                };
                img.onerror = error => reject(error);
            }
        };
        reader.onerror = error => reject(error);
    });
};
