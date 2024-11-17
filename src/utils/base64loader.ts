export function LoadDataFromURL(url) : Promise<string | null> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            const reader = new FileReader();
            reader.onloadend = function() {
                resolve(reader.result as string);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = function() {
            reject('Failed to load image    ' + url);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    });
}

export function LoadDataFromFile(element: HTMLInputElement) : Promise<string | null>
{
    return new Promise((resolve, reject) => {
        if (!element.files || element.files.length === 0) {
            reject(null);
            return;
        }
        const file = element.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            resolve(reader.result as string)
        }
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function replaceResourceName(name: string) {
    return name.replace(/[^a-zA-Z0-9]/g, '_');
}