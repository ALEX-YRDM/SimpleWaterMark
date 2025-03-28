/**
 * 您可以将常用的方法、或系统 API，统一封装，暴露全局，以便各页面、组件调用，而无需 require / import.
 */
const prompt = require('@system.prompt')
const router = require('@system.router')
const storage = require('@system.storage')
/**
 * 拼接 url 和参数
 */
function queryString(url, query) {
  let str = []
  for (let key in query) {
    str.push(key + '=' + query[key])
  }
  let paramStr = str.join('&')
  return paramStr ? `${url}?${paramStr}` : url
}

function showToast(message = '', duration = 0) {
  if (!message) return
  prompt.showToast({
    message: message,
    duration
  })
}

/**
 * @desc 显示菜单
 */
 function showMenu() {
  const page = router.getState()
  const itemList =
    page.path === '/pages/main'
      ? ['保存桌面', '取消']
      : ['保存桌面', '返回首页', '取消']
  const itemFuncMapping =
    page.path === '/pages/main'
      ? [createShortcut, null]
      : [createShortcut, gotoMain, null]
  prompt.showContextMenu({
    itemList,
    success: function(ret) {
      if (itemFuncMapping[ret.index]) {
        itemFuncMapping[ret.index]()
      }
    }
  })
}

/**
 * @desc 创建桌面图标
 * 注意：使用加载器测试`创建桌面快捷方式`功能时，请先在`系统设置`中打开`应用加载器`的`桌面快捷方式`权限
 */
function createShortcut() {
  const shortcut = require('@system.shortcut')
  shortcut.hasInstalled({
    success: function(ret) {
      if (ret) {
        prompt.showToast({
          message: '已创建桌面图标'
        })
      } else {
        shortcut.install({
          success: function() {
            prompt.showToast({
              message: '成功创建桌面图标'
            })
          },
          fail: function(errmsg, errcode) {
            prompt.showToast({
              message: `${errcode}: ${errmsg}`
            })
          }
        })
      }
    }
  })
}

function gotoMain() {
  let page = router.getState()
  console.log(page)
  if (page.path !== '/pages/main') {
    router.push({
      uri: '/pages/main'
    })
  }
}


function setStorage(key, value) {
  // 设置storage
  storage.set({
    key,
    value: value,
    fail(data, code) {
      console.log(`setStorage fail, code = ${code}`)
    }
  })
}

function getStorage(key) {
  return new Promise((resolve, reject) => {
    // 获取storage
    storage.get({
      key,
      success(data) {
        if (data) {
          resolve(data)
        }
      },
      fail(data, code) {
        console.log(`getStorage fail, code = ${code}`)
        reject({ data, code })
      }
    })
  })
}
export default {
  showMenu,
  createShortcut,
  queryString,
  setStorage,
  getStorage,
  route2theUrl(url, params, clear = false) {
    router.push({
      uri: url,
      params: params
    })
    if (clear) {
      router.clear()
    }
  },
  showToast(message = '', duration = 0) {
    if (!message) return
    prompt.showToast({
      message: message,
      duration
    })
  },
}
