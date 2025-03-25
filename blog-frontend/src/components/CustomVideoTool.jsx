export default class CustomVideoTool {
  static get toolbox() {
    return {
      title: 'Video',
      icon: '<svg width="20" height="20"><path d="M4 4h12v12H4z" stroke="currentColor" fill="none"/></svg>',
    };
  }

  constructor({ data, api, config }) {
    this.data = data || {};
    this.api = api;
    this.uploader = config.uploader;
  }

  render() {
    this.wrapper = document.createElement('div');

    if (this.data.url) {
      const video = document.createElement('video');
      video.src = this.data.url;
      video.controls = true;
      video.style.maxWidth = '100%';
      this.wrapper.appendChild(video);
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (file) {
          const res = await this.uploader.uploadByFile(file);
          if (res && res.file && res.file.url) {
            this.data = { url: res.file.url };
            this.wrapper.innerHTML = '';
            const video = document.createElement('video');
            video.src = res.file.url;
            video.controls = true;
            video.style.maxWidth = '100%';
            this.wrapper.appendChild(video);
          }
        }
      });
      this.wrapper.appendChild(input);
    }
    return this.wrapper;
  }

  save() {
    return this.data;
  }
}
