Hooks.once("init", () => {
  // socket
  game.socket.on("module.videoclipviewer", (data) => {
    if (data.path) {
      new VideoClipViewer({
        baseApplication: "VideoClipViewer",
        minimizable: true,
        path: data.path,
      }).render(true);
    }
  });
});

Hooks.on("getSceneControlButtons", (controls) => {
  // check if gm
  if (!game.user.isGM) {
    return;
  }

  // init tools array for buttons
  let tools = [];

  try {
    // add gm option to send clip to everyone
    if (game.user.isGM) {
      tools = tools.concat([
        {
          name: "Send Video Clip",
          title: "Send Video Clip",
          icon: "fas fa-paper-plane",
          button: true,
          onClick: () => {
            new FilePicker({
              displayMode: "thumbs",
              callback: sendClip,
            }).render(true);
          },
        },
      ]);
    }

  } catch (e) {
    if (privateSettings.length != 0 || settings.length != 0) {
      console.error(e);
      Hooks.once("ready", () => {
        ui.notifications.info("Error creating tool buttons");
      });
    }
  }

  // create button list
  controls.push({
    name: "Video Clip Viewer",
    title: "Video Clip Viewer",
    layer: "controls",
    icon: "far fa-file-video",
    tools: tools,
  });
});

class VideoClipViewer extends Application {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      minimizable: false,
      template: "modules/videoclipviewer/templates/videoclipviewer.html",
      popOut: true,
      left: 125,
      top: 70,
    });
  }

  async getData(options) {
    const data = super.getData(options);
    data.path = this.options.path;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    let parent = this

    html.find("#video").on('loadeddata', function () {
      this.play()
    })

    html.find("#video").on('play', function () {
      let videoWidth = html[0].children[0].videoWidth
      let videoHeight = html[0].children[0].videoHeight

      let aspectRatio = videoWidth / videoHeight

      let maxWidth = self.innerWidth * 0.8
      let maxHeight = self.innerHeight * 0.75

      parent.element.width(html[0].children[0].videoWidth + 15)
      parent.element.height(html[0].children[0].videoHeight + 50)

      if (videoWidth > maxWidth) {
        parent.element.width(maxWidth + 15)
        this.width = maxWidth

        parent.element.height(maxWidth / aspectRatio + 50)
        this.heigth = maxWidth / aspectRatio
      }
      
      if (videoHeight > maxHeight) {
        parent.element.height(maxHeight + 50)
        this.height = maxHeight

        parent.element.width(maxHeight * aspectRatio + 15)
        this.width = maxHeight * aspectRatio
      }
    })

    // html.find("#video").on('ended', function () {
    //   parent.close()
    // })
  }
}

function sendClip(path) {
  game.socket.emit("module.videoclipviewer", {
    path: path,
  });
  new VideoClipViewer({
    baseApplication: "VideoClipViewer",
    minimizable: true,
    path: path,
  }).render(true);
}