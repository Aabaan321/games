// preload.js
const ASSETS = {
    images: {
        fruits: [
            { name: 'apple', src: 'data:image/png;base64,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' },
            { name: 'orange', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADsQAAA7EB9YPtSQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAqPSURBVGiB7Zl5cF3Vfcc/v3Pue0vSk2RJlmQ5trAD3hcgYE/BJVAgmS5JO2k6pEMzHdL0j7TTSf9opm1mOrTTTptJ2kw7NM0GCWmakIT0DyAJJAFiGxMb8IJ3ZHmRF8mrVz29667n9I+nJ+lJepKejcP0O3Nm7j3nd37n+/3ec37n/n7nwcd8zP/rEBf7wTMNO68XQnxeKXWLUmqBUiokhAhIKX2u60oAKaVtGIYVjycTsVhsYN++fS8eOnToGID6sEG4Gk87zZs3T+bm5q5SSt0H3KCUcnw+X4kQokRK6RdC4DiOtG3bdhzHcRzHQSmFaZqulNJ1XVe5ruu6ruu6ruM4juW6Ls3NzfbRo0fbX3vttZ2HDx9+czIgVHd3N/F4HCnlvwQCgRyl1EohxEohxEIpZbkQokgIEQSElPL8OEIIlFK4ruu6rusorUOQUgohhBJCKCmlklIqKSVSShzHobe3V7W0tNiHDx+OHjp06O2dO3e+rigXlQ0AIJVK4ff78fl8GIaBaZpordFao7XGcRwcx8FxHFKpFMlkkmQySTabxbZtbNvGsixs2yabzWLbNtlsFq01AI7joJTC5/Ph9/sxTROfz0cwGCQYDBIIBAgGg4RCIXJDIZ3lcxwntXfv3l379+9/rq6u7g9KqZvOm27atKkDWCmlLJNSFmutC7TWBUqpkFIqoJTySymFEEJqrUOGYYQ8z/MJIQK2bfts2/YrpXxKKSmEQAhxYZBSSillGIbUWkuttehtwYBQUjoC4boChItQGqEVKKWUUq5SylFKOUopSymV1VpnlFJprXVaa53SWme11lkppZ1IJBJvvfXW3oaGhv1vvPFGO4B4/fXXrz1z5swLWutPlpeXB5qamshms9i2jW3b2LaNbds4joNt22QyGbLZLJlMBsuysCwLrTVaa7TWaK0BMPE8YEIwJ0IphRACwzDw+/0YhoHP58Pn8xEIBPD7/QQCAUzTJBAIYBgGpmliGAaGYSCEQEqJ53lks1kikQiWZaG1xrZtHMchk8mQSqVIp9Ok02nS6TSWZZFOpykuLqa6upq
            // ... more base64 encoded images ...
        ],
        splashes: [
            { name: 'red', src: 'data:image/png;base64,...' },
            { name: 'orange', src: 'data:image/png;base64,...' },
            // ... more splash effects ...
        ]
    },
    sounds: {
        slice: 'data:audio/mp3;base64,...',
        bomb: 'data:audio/mp3;base64,...',
        combo: 'data:audio/mp3;base64,...',
        gameOver: 'data:audio/mp3;base64,...',
        background: 'data:audio/mp3;base64,...'
    }
};

// Load all assets
const loadedAssets = {
    images: {},
    sounds: {}
};

function preloadAssets(callback) {
    let totalAssets = Object.keys(ASSETS.images.fruits).length + 
                      Object.keys(ASSETS.images.splashes).length + 
                      Object.keys(ASSETS.sounds).length;
    let loadedCount = 0;

    function assetLoaded() {
        loadedCount++;
        if (loadedCount === totalAssets) {
            callback();
        }
    }

    // Load images
    ASSETS.images.fruits.forEach(fruit => {
        const img = new Image();
        img.onload = assetLoaded;
        img.src = fruit.src;
        loadedAssets.images[fruit.name] = img;
    });

    ASSETS.images.splashes.forEach(splash => {
        const img = new Image();
        img.onload = assetLoaded;
        img.src = splash.src;
        loadedAssets.images[splash.name] = img;
    });

    // Load sounds
    Object.entries(ASSETS.sounds).forEach(([name, src]) => {
        const audio = new Audio();
        audio.oncanplaythrough = assetLoaded;
        audio.src = src;
        loadedAssets.sounds[name] = audio;
    });
}
