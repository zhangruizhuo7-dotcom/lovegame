<template>
  <div v-if="!authState.isLoggedIn" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-rose-200 relative overflow-hidden animate-float">
      <!-- 装饰背景 -->
      <div class="absolute -right-8 -top-8 w-32 h-32 bg-rose-200/40 rounded-full blur-xl pointer-events-none"></div>

      <!-- 头部 -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 mx-auto mb-3 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-3xl shadow-lg shadow-rose-200">
          💍
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">情侣双端连接 · 角色登记</h2>
        <p class="text-xs text-slate-500 mt-1">
          本站专属于你们两人！请创建或登录角色以开启双机实时连线
        </p>
      </div>

      <!-- Tab 切换 -->
      <div class="flex bg-slate-100 p-1 rounded-2xl mb-5 text-xs font-bold">
        <button 
          @click="mode = 'register'"
          :class="mode === 'register' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          class="flex-1 py-2 rounded-xl transition-all"
        >
          ✨ 创建新角色 (选男女)
        </button>
        <button 
          @click="mode = 'login'"
          :class="mode === 'login' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          class="flex-1 py-2 rounded-xl transition-all"
        >
          🔑 已有账号登录
        </button>
      </div>

      <!-- 表单区域 -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- 性别选择（创建角色时强制选择） -->
        <div v-if="mode === 'register'" class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 flex items-center gap-1">
            <span>选择你的性别与角色身份</span>
            <span class="text-rose-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="form.gender = 'male'"
              :class="form.gender === 'male' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm ring-2 ring-sky-300' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
              class="border-2 rounded-2xl p-3 flex flex-col items-center gap-1 transition-all"
            >
              <span class="text-3xl">👦</span>
              <span class="text-xs font-bold">我是男生 (男友)</span>
            </button>

            <button
              type="button"
              @click="form.gender = 'female'"
              :class="form.gender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm ring-2 ring-pink-300' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
              class="border-2 rounded-2xl p-3 flex flex-col items-center gap-1 transition-all"
            >
              <span class="text-3xl">👧</span>
              <span class="text-xs font-bold">我是女生 (女友)</span>
            </button>
          </div>
        </div>

        <!-- 昵称（创建角色） -->
        <div v-if="mode === 'register'" class="space-y-1">
          <label class="text-xs font-bold text-slate-700">角色昵称 (对方能看到的名字)</label>
          <input 
            v-model="form.nickname"
            type="text" 
            placeholder="例如：阿哲 / 小涵 / 大白熊" 
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs sm:text-sm"
          />
        </div>

        <!-- 账号 -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-700">登录账号 (随意设定)</label>
          <input 
            v-model="form.username"
            type="text" 
            placeholder="例如：boy / girl / yourname" 
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs sm:text-sm"
          />
        </div>

        <!-- 密码 -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-700 flex justify-between">
            <span>登录密码 (由系统自动记录)</span>
          </label>
          <input 
            v-model="form.password"
            type="password" 
            placeholder="输入任意密码即可" 
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs sm:text-sm"
          />
        </div>

        <!-- 提示栏 -->
        <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-700 leading-relaxed">
          🔒 <strong>密码已由系统负责记录保存</strong>：所有账号、密码与恋爱树成长数据均已实时归档存盘，换设备或清理缓存后凭此账号直接登录！
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMsg" class="text-xs text-rose-600 bg-rose-100/80 p-2 rounded-lg font-semibold text-center">
          {{ errorMsg }}
        </div>

        <!-- 提交按钮 -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition-all text-sm active:scale-95 disabled:opacity-50"
        >
          {{ loading ? '处理中...' : (mode === 'register' ? '💖 创建角色并进入小站' : '🔑 验证登录并连接') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { authState, registerUser, loginUser } from '../网络/联机服务.js'
import confetti from 'canvas-confetti'

const mode = ref('register')
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  gender: 'male' // 默认男生
})

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true

  try {
    if (mode.value === 'register') {
      if (!form.nickname) form.nickname = form.gender === 'male' ? '👦 男友' : '👧 女友'
      await registerUser({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        gender: form.gender
      })
    } else {
      await loginUser({
        username: form.username,
        password: form.password
      })
    }

    try {
      confetti({ particleCount: 80, spread: 60 })
    } catch (e) {}

  } catch (err) {
    errorMsg.value = err.message || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
