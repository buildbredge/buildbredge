export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">管理员路由测试</h1>
        <p className="text-gray-600 mb-4">如果您能看到这个页面，说明管理员路由工作正常。</p>
        <a href="/htgl/login" className="text-blue-600 hover:underline">
          前往管理员登录页面
        </a>
      </div>
    </div>
  )
}
