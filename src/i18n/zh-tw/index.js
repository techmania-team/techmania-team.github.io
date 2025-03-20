export default {
  // pages/MainLayout.vue - navbar items
  nav: {
    howtoplay: '如何遊玩',
    documentations: '說明文件',
    changelog: '更新紀錄',
    patterns: '譜面',
    skins: '造型',
    login: '登入',
    myPage: '個人檔案',
    submitNewPattern: '上傳新譜面',
    submitNewSkin: '上傳新造型',
    logout: '登出',
    menu: '選單',
    language: '語言',
  },
  // pages/IndexPage.vue
  indexPage: {
    download: '遊戲下載',
    latestVersion: '最新版本',
    latestReleaseDate: '發布於',
    newPatterns: '最新譜面',
    newSkins: '最新造型',
    videos: '遊戲影片',
  },
  // pages/ChangelogPage.vue
  changelogPage: {
    title: '更新紀錄',
    downloads: '下載數',
    showDetail: '顯示內容',
    hideDetail: '隱藏內容',
  },
  // pages/PatternsPage.vue
  patternsPage: {
    title: '譜面',
    searchForm: {
      keywords: {
        placeholder: '請輸入關鍵字...',
      },
      keysounded: {
        label: '按鍵音',
        all: '不限',
        yes: '有',
        no: '無',
      },
      control: {
        label: '控制方式',
        touch: '觸控',
        keys: '鍵盤',
        km: '鍵鼠',
      },
      lanes: {
        label: '軌道數',
        lanes: '{lanes}',
      },
      sort: {
        label: '排序',
        submit: '上傳日期',
        update: '更新日期',
        name: '曲名',
        rating: '評分',
      },
    },
    notFound: '找不到譜面',
  },
  // pages/PatternPage.vue
  patternPage: {
    download: '下載',
    edit: '編輯',
    basic: {
      title: '譜面資訊',
      composer: {
        label: '作曲家',
      },
      submittedBy: {
        label: '上傳者',
      },
      keysounded: {
        label: '按鍵音',
        yes: '有',
        no: '無',
      },
      comments: {
        count: '{count} 則評價',
      },
    },
    difficulties: {
      title: '難度',
    },
    description: {
      title: '說明',
      noDescription: '沒有說明',
    },
    previews: {
      title: '預覽',
      noPreview: '沒有預覽',
    },
  },
  // pages/PatternFormPage.vue
  patternFormPage: {
    titleNew: '上傳新譜面',
    titleEdit: '編輯譜面',
    rules: {
      title: '在送出您的譜面前請先閱讀下列規則：',
      rule1: '嚴禁上傳使用 DJMAX 和 DJMAX RESPECT 原創歌曲製作的譜面。',
      rule2: '請勿上傳包含成人內容的譜面。',
      rule3: '請勿上傳其他人製作的譜面。',
    },
    basic: {
      title: '譜面資訊',
      name: {
        label: '曲名',
        error: {
          required: '必填欄位',
        },
      },
      composer: {
        label: '作曲家',
        error: {
          required: '必填欄位',
        },
      },
      download: {
        label: '下載連結',
        error: {
          required: '必填欄位',
          invalid: '無效網址',
        },
      },
      keysounded: {
        label: '按鍵音',
        error: {
          required: '必填欄位',
        },
      },
      image: {
        label: '圖片預覽',
        error: {
          invalid: '無效網址',
        },
      },
    },
    preview: {
      title: 'YouTube 預覽',
      name: {
        label: '名稱',
        error: {
          required: '必填欄位',
        },
      },
      link: {
        label: 'YouTube 連結',
        error: {
          required: '必填欄位',
          invalid: '無效網址',
          youtube: '無效 YouTube 網址',
        },
      },
    },
    difficulties: {
      title: '難度',
      control: {
        label: '控制方式',
        touch: '觸控',
        keys: '鍵盤',
        km: '鍵鼠',
        error: {
          required: '必填欄位',
          invalid: '無效選項',
        },
      },
      lanes: {
        label: '軌道數',
        error: {
          required: '必填欄位',
          min: '無效選項',
          max: '無效選項',
        },
      },
      name: {
        label: '名稱',
        error: {
          required: '必填欄位',
        },
      },
      level: {
        label: '等級',
        error: {
          required: '必填欄位',
          min: '無效等級',
        },
      },
    },
    description: {
      title: '說明',
    },
    dangerZone: {
      title: '危險區域',
      delete: {
        label: '刪除譜面',
        button: '刪除譜面',
      },
    },
    tos: {
      label: '送出譜面代表您已閱讀並同意<a href="{tosURL}" target="_blank">使用條款</a>',
      error: {
        required: '您必須同意使用條款',
      },
    },
    submit: {
      new: '上傳',
      edit: '編輯',
    },
    deleteDialog: {
      text: '您真的要刪除這個譜面嗎？',
      no: '否，取消',
      yes: '是, 刪除',
    },
    result: {
      deleted: '刪除成功',
      updated: '編輯成功',
    },
  },
  // components/PatternCard.vue
  patternCard: {
    comments: {
      count: '{Count} 則評價',
    },
    submittedBy: '上傳者: {Name}',
    submittedAt: '上傳於: {Date}',
    updatedAt: '最後更新於 {Date}',
    keysounded: '按鍵音',
    control: {
      touch: '觸控',
      keys: '鍵盤',
      km: '鍵鼠',
    },
  },
  // pages/SkinsPage.vue
  skinsPage: {
    title: '造型',
    searchForm: {
      keywords: {
        placeholder: '請輸入關鍵字...',
      },
      type: {
        label: '類型',
        note: '音符',
        vfx: '特效',
        combo: '連擊',
        gameUI: '遊戲介面',
        theme: '主題',
      },
      sort: {
        label: '排序',
        submit: '上傳日期',
        update: '更新日期',
        name: '名稱',
        rating: '評分',
      },
    },
    notFound: '找不到造型',
  },
  // pages/SkinPage.vue
  skinPage: {
    download: '下載',
    edit: '編輯',
    basic: {
      title: '造型資訊',
      submittedBy: {
        label: '上傳者',
      },
      type: {
        label: '類型',
        note: '音符',
        vfx: '特效',
        combo: '連擊',
        gameUI: '遊戲介面',
        theme: '主題',
      },
      comments: {
        count: '{count} 則評價',
      },
    },
    description: {
      title: '說明',
      noDescription: '沒有說明',
    },
    previews: {
      title: '預覽',
      noPreview: '沒有預覽',
    },
  },
  // pages/SkinFormPage.vue
  skinFormPage: {
    titleNew: '上傳新造型',
    titleEdit: '編輯造型',
    rules: {
      title: '在送出您的造型前請先閱讀下列規則：',
      rule1: '嚴禁上傳使用 DJMAX 和 DJMAX RESPECT 素材製作的造型。',
      rule2: '請勿上傳包含成人內容的造型。',
      rule3: '請勿上傳其他人製作的造型。',
    },
    basic: {
      title: '造型資訊',
      name: {
        label: '名稱',
        error: {
          required: '必填欄位',
        },
      },
      type: {
        label: '類型',
        note: '音符',
        vfx: '特效',
        combo: '連擊',
        gameUI: '遊戲介面',
        theme: '主題',
        error: {
          required: '必填欄位',
          invalid: '無效選項',
        },
      },
      download: {
        label: '下載連結',
        error: {
          required: '必填欄位',
          invalid: '無效網址',
        },
      },
      image: {
        label: '圖片預覽',
        error: {
          invalid: '無效網址',
        },
      },
    },
    preview: {
      title: 'YouTube 預覽',
      name: {
        label: '名稱',
        error: {
          required: '必填欄位',
        },
      },
      link: {
        label: 'YouTube 連結',
        error: {
          required: '必填欄位',
          invalid: '無效網址',
          youtube: '無效 YouTube 網址',
        },
      },
    },
    description: {
      title: '說明',
    },
    dangerZone: {
      title: '危險區域',
      delete: {
        label: '刪除造型',
        button: '刪除造型',
      },
    },
    tos: {
      label: '送出造型代表您已閱讀並同意<a href="{tosURL}" target="_blank">使用條款</a>',
      error: {
        required: '您必須同意使用條款',
      },
    },
    submit: {
      new: '上傳',
      edit: '編輯',
    },
    deleteDialog: {
      text: '您真的要刪除這個造型嗎？',
      no: '否，取消',
      yes: '是, 刪除',
    },
    result: {
      deleted: '刪除成功',
      updated: '編輯成功',
    },
  },
  // components/SkinCard.vue
  skinCard: {
    comments: {
      count: '{Count} 則評價',
    },
    submittedBy: '上傳者: {Name}',
    submittedAt: '上傳於: {Date}',
    updatedAt: '最後更新於 {Date}',
    type: {
      label: '類型',
      note: '音符',
      vfx: '特效',
      combo: '連擊',
      gameUI: '遊戲介面',
      theme: '主題',
    },
  },
  // components/commentList.vue
  commentList: {
    commentForm: {
      title: {
        pattern: '評價這個譜面',
        skin: '評價這個造型',
      },
      submit: '送出',
      comment: {
        error: {
          required: '必填欄位',
        },
      },
      rating: {
        error: {
          required: '必填欄位',
          min: '無效選項',
          max: '無效選項',
        },
      },
    },
    replyForm: {
      comment: {
        error: {
          required: '必填欄位',
        },
      },
    },
    comments: {
      title: '評價',
      notFound: '沒有評價',
    },
    dialog: {
      title: {
        comment: '編輯評價',
        reply: '回覆',
        edit: '編輯回覆',
      },
      submit: {
        comment: '編輯',
        reply: '回覆',
        edit: '編輯',
      },
      cancel: '取消',
    },
  },
  profile: {
    tab: {
      patterns: '譜面',
      skins: '造型',
      comments: '評價',
    },
  },
}
