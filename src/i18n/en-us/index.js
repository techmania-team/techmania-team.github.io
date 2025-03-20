export default {
  // pages/MainLayout.vue - navbar items
  nav: {
    howtoplay: 'How to Play',
    documentations: 'Documentations',
    changelog: 'Changelog',
    patterns: 'Patterns',
    skins: 'Skins',
    login: 'Login',
    myPage: 'My Page',
    submitNewPattern: 'Submit New Pattern',
    submitNewSkin: 'Submit New Skin',
    logout: 'Logout',
  },
  // pages/IndexPage.vue
  indexPage: {
    download: 'Download',
    latestVersion: 'Latest Version',
    latestReleaseDate: 'Released at ',
    newPatterns: 'New Patterns',
    newSkins: 'New Skins',
    videos: 'Videos',
  },
  // pages/ChangelogPage.vue
  changelogPage: {
    title: 'Changelog',
    downloads: 'Downloads',
    showDetail: 'Show Detail',
    hideDetail: 'Hide Detail',
  },
  // pages/PatternsPage.vue
  patternsPage: {
    title: 'Patterns',
    searchForm: {
      keywords: {
        placeholder: 'Please enter Keywords...',
      },
      keysounded: {
        label: 'Keysounded',
        all: 'All',
        yes: 'Yes',
        no: 'No',
      },
      control: {
        label: 'Control',
        touch: 'Touch',
        keys: 'Keys',
        km: 'KM',
      },
      lanes: {
        label: 'Lanes',
        lanes: '{lanes}L',
      },
      sort: {
        label: 'Sort',
        submit: 'Submit Date',
        update: 'Update Date',
        name: 'Song Name',
        rating: 'Rating',
      },
    },
    notFound: 'No patterns found',
  },
  // pages/PatternPage.vue
  patternPage: {
    download: 'Download',
    edit: 'Edit',
    basic: {
      title: 'Basic Information',
      composer: {
        label: 'Composer',
      },
      submittedBy: {
        label: 'Submitted By',
      },
      keysounded: {
        label: 'Keysounded',
        yes: 'Yes',
        no: 'No',
      },
      comments: {
        count: '{count} Comments',
      },
    },
    difficulties: {
      title: 'Difficulties',
    },
    description: {
      title: 'Description',
      noDescription: 'No description',
    },
    previews: {
      title: 'Previews',
      noPreview: 'No preview',
    },
  },
  // pages/PatternFormPage.vue
  patternFormPage: {
    titleNew: 'Submit New Pattern',
    titleEdit: 'Edit Pattern',
    rules: {
      title: 'Please read the rules before you submit your pattern.',
      rule1: 'Patterns using original music from DJMAX and DJMAX Respect are strictly prohibited.',
      rule2: 'All Artwork and BGAs must contain SFW content.',
      rule3: 'Uploading other users patterns are not allowed.',
    },
    basic: {
      title: 'Basic Information',
      name: {
        label: 'Song Name',
        error: {
          required: 'Song Name is required',
        },
      },
      composer: {
        label: 'Composer',
        error: {
          required: 'Composer is required',
        },
      },
      download: {
        label: 'Download Link',
        error: {
          required: 'Download Link is required',
          invalid: 'Please enter a valid URL.',
        },
      },
      keysounded: {
        label: 'Keysounded',
        error: {
          required: 'Keysounded is required',
        },
      },
      image: {
        label: 'Image Preview',
        error: {
          invalid: 'Please enter a valid URL.',
        },
      },
    },
    preview: {
      title: 'YouTube Preview',
      name: {
        label: 'Name',
        error: {
          required: 'Name is required',
        },
      },
      link: {
        label: 'YouTube Link',
        error: {
          required: 'YouTube Link is required',
          invalid: 'Please enter a valid URL.',
          youtube: 'Please enter a valid YouTube URL.',
        },
      },
    },
    difficulties: {
      title: 'Difficulties',
      control: {
        label: 'Control',
        touch: 'Touch',
        keys: 'Keys',
        km: 'KM',
        error: {
          required: 'Control is required',
          invalid: 'Control is invalid',
        },
      },
      lanes: {
        label: 'Lanes',
        error: {
          required: 'Lanes is required',
          min: 'Lanes is invalid',
          max: 'Lanes is invalid',
        },
      },
      name: {
        label: 'Name',
        error: {
          required: 'Name is required',
        },
      },
      level: {
        label: 'Level',
        error: {
          required: 'Level is required',
          min: 'Level must be greater than 0',
        },
      },
    },
    description: {
      title: 'Description',
    },
    dangerZone: {
      title: 'DANGER ZONE',
      delete: {
        label: 'DELETE THIS PATTERN',
        button: 'DELETE THIS PATTERN',
      },
    },
    tos: {
      label:
        'Submitting the pattern signifies that you have read and agree to the <a href="{tosURL}" target="_blank">Terms of Service</a>.',
      error: {
        required: 'You need to accept the terms first.',
      },
    },
    submit: {
      new: 'Submit',
      edit: 'Update',
    },
    deleteDialog: {
      text: 'DO YOU REALLY WANT TO DELETE THIS PATTERN?',
      no: 'NO, CANCEL',
      yes: 'YES, DELETE IT',
    },
    result: {
      deleted: 'Successfully deleted.',
      updated: 'Successfully updated.',
    },
  },
  // components/PatternCard.vue
  patternCard: {
    comments: {
      count: '{Count} Comments',
    },
    submittedBy: 'Submitted by {Name}',
    submittedAt: 'Submitted at {Date}',
    updatedAt: 'Updated at {Date}',
    keysounded: 'Keysounded',
    control: {
      touch: 'Touch',
      keys: 'Keys',
      km: 'KM',
    },
  },
  // pages/SkinsPage.vue
  skinsPage: {
    title: 'Skins',
    searchForm: {
      keywords: {
        placeholder: 'Please enter Keywords...',
      },
      type: {
        label: 'Skin Type',
        note: 'Note',
        vfx: 'VFX',
        combo: 'Combo',
        gameUI: 'Game UI',
        theme: 'Theme',
      },
      sort: {
        label: 'Sort',
        submit: 'Submit Date',
        update: 'Update Date',
        name: 'Skin Name',
        rating: 'Rating',
      },
    },
    notFound: 'No skins found',
  },
  // pages/SkinPage.vue
  skinPage: {
    download: 'Download',
    edit: 'Edit',
    basic: {
      title: 'Basic Information',
      submittedBy: {
        label: 'Submitted By',
      },
      type: {
        label: 'Skin Type',
        note: 'Note',
        vfx: 'VFX',
        combo: 'Combo',
        gameUI: 'Game UI',
        theme: 'Theme',
      },
      comments: {
        count: '{count} Comments',
      },
    },
    description: {
      title: 'Description',
      noDescription: 'No description',
    },
    previews: {
      title: 'Previews',
      noPreview: 'No preview',
    },
  },
  // pages/SkinFormPage.vue
  skinFormPage: {
    titleNew: 'Submit New Skin',
    titleEdit: 'Edit Skin',
    rules: {
      title: 'Please read the rules before you submit your skin.',
      rule1: 'Skins using assets from DJMAX and DJMAX Respect are strictly prohibited.',
      rule2: 'All assets must contain SFW content.',
      rule3: 'Uploading other users skins are not allowed.',
    },
    basic: {
      title: 'Basic Information',
      name: {
        label: 'Skin Name',
        error: {
          required: 'Skin Name is required',
        },
      },
      type: {
        label: 'Skin Type',
        note: 'Note',
        vfx: 'VFX',
        combo: 'Combo',
        gameUI: 'Game UI',
        theme: 'Theme',
        error: {
          required: 'Skin Type is required',
          invalid: 'Skin Type is invalid',
        },
      },
      download: {
        label: 'Download Link',
        error: {
          required: 'Download Link is required',
          invalid: 'Please enter a valid URL.',
        },
      },
      image: {
        label: 'Image Preview',
        error: {
          invalid: 'Please enter a valid URL.',
        },
      },
    },
    preview: {
      title: 'YouTube Preview',
      name: {
        label: 'Name',
        error: {
          required: 'Name is required',
        },
      },
      link: {
        label: 'YouTube Link',
        error: {
          required: 'YouTube Link is required',
          invalid: 'Please enter a valid URL.',
          youtube: 'Please enter a valid YouTube URL.',
        },
      },
    },
    description: {
      title: 'Description',
    },
    dangerZone: {
      title: 'DANGER ZONE',
      delete: {
        label: 'DELETE THIS SKIN',
        button: 'DELETE THIS SKIN',
      },
    },
    tos: {
      label:
        'Submitting the skin signifies that you have read and agree to the <a href="{tosURL}" target="_blank">Terms of Service</a>.',
      error: {
        required: 'You need to accept the terms first.',
      },
    },
    submit: {
      new: 'Submit',
      edit: 'Update',
    },
    deleteDialog: {
      text: 'DO YOU REALLY WANT TO DELETE THIS SKIN?',
      no: 'NO, CANCEL',
      yes: 'YES, DELETE IT',
    },
    result: {
      deleted: 'Successfully deleted.',
      updated: 'Successfully updated.',
    },
  },
  // components/SkinCard.vue
  skinCard: {
    comments: {
      count: '{Count} Comments',
    },
    submittedBy: 'Submitted by {Name}',
    submittedAt: 'Submitted at {Date}',
    updatedAt: 'Updated at {Date}',
    type: {
      label: 'Skin Type',
      note: 'Note',
      vfx: 'VFX',
      combo: 'Combo',
      gameUI: 'Game UI',
      theme: 'Theme',
    },
  },
  // components/commentList.vue
  commentList: {
    commentForm: {
      title: {
        pattern: 'Rate This Pattern',
        skin: 'Rate This Skin',
      },
      submit: 'Submit',
      comment: {
        error: {
          required: 'Comment is required',
        },
      },
      rating: {
        error: {
          required: 'Rating is required',
          min: 'Rating is invalid',
          max: 'Rating is invalid',
        },
      },
    },
    replyForm: {
      comment: {
        error: {
          required: 'Comment is required',
        },
      },
    },
    comments: {
      title: 'Comments',
      notFound: 'No comments found',
    },
    dialog: {
      title: {
        comment: 'Edit My Comment',
        reply: 'Reply',
        edit: 'Edit My Reply',
      },
      submit: {
        comment: 'Update',
        reply: 'Submit',
        edit: 'Update',
      },
      cancel: 'Cancel',
    },
  },
  profile: {
    tab: {
      patterns: 'Patterns',
      skins: 'Skins',
      comments: 'Comments',
    },
  },
}
