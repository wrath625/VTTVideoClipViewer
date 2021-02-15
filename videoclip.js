Hooks.once("init", () => {
  // socket
  game.socket.on("module.videoclip", (data) => {
    if (data.path) {
      if (data.userList === undefined || data.userList.length === 0 || data.userList.includes(game.user._id)) {
        new VideoClipViewer({
          baseApplication: "VideoClipViewer",
          minimizable: true,
          path: data.path,
        }).render(true);
      }
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
    // add gm option to send url to everyone
    if (game.user.isGM) {
      tools = tools.concat([
        {
          name: game.i18n.localize("videoClipViewer.gm.tools.name"),
          title: game.i18n.localize("videoClipViewer.gm.tools.title"),
          icon: "fas fa-paper-plane",
          button: true,
          onClick: () => {
            new UrlShareDialog().render(true);
          },
        },
      ]);
    }

  } catch (e) {
    if (privateSettings.length != 0 || settings.length != 0) {
      console.error(e);
      Hooks.once("ready", () => {
        ui.notifications.info(game.i18n.localize("videoClipViewer.notifications.error"));
      });
    }
  }

  // create button list
  controls.push({
    name: "VideoClips",
    title: "videoClipViewer.button",
    layer: "ControlsLayer",
    icon: "far fa-file-video-o",
    tools: tools,
  });
});

class VideoClipViewer extends Application {
  constructor(options) {
    super({}, options);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      minimizable: false,
      template: "modules/videoclip/templates/videoclipviewer.html",
      popOut: true,
    });
  }
}

class VideoClipPicker extends FilePicker {
  constructor(options) {
    super({}, options);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
        displayMode: "thumbs",
        callback: this.send,
    });
  }

  send(path, userList) {
    game.socket.emit("module.videoclip", {
      path: path,
      userList: userList,
    });
    if (userList === undefined || userList.length === 0 || userList.includes(game.user._id)) {
      new InlineViewer({
        baseApplication: "VideoClipViewer",
        minimizable: true,
        path: data.path,
      }).render(true);
    }
  }
}