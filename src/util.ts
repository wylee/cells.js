const $requestFullscreen = [
    'requestFullscreen',
    'mozRequestFullscreen',
    'msRequestFullscreen',
    'webkitRequestFullscreen'
]
    .map(name => document.documentElement[name])
    .find(item => typeof item !== 'undefined');

const $exitFullscreen = [
    'exitFullscreen',
    'mozExitFullscreen',
    'msExitFullscreen',
    'webkitExitFullscreen'
]
    .map(name => document[name])
    .find(item => typeof item !== 'undefined');

export const enterFullscreen = async () => {
    if ($requestFullscreen) {
        try {
            await $requestFullscreen.call(document.body);
        } catch (e) {
            console.error(`Encountered error while entering fullscreen: ${e}`);
        }
    }
};

export const exitFullscreen = async () => {
    if ($exitFullscreen) {
        try {
            await $exitFullscreen.call(document);
        } catch (e) {
            console.error(`Encountered error while exiting fullscreen: ${e}`);
        }
    }
};
