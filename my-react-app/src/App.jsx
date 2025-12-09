import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Package, Plus, Edit2, Trash2, Check, X, Sun, Cloud, CloudRain, Globe, TrendingUp } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const TravelToolApp = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [expenses, setExpenses] = useState([]);
  const [packingList, setPackingList] = useState([]);
  const [stats, setStats] = useState(null); //設定null是因為避免渲染的時候提前嘗試讀取不存在的資料
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [weather, setWeather] = useState(null);
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(false);

  // 渲染完畫面後，才會跑 useEffect
  useEffect(() => {
    loadExpenses();
    loadPackingList();
    loadStats();
  }, []); //空的[]表示只在component出現在畫面上時執行一次

  // ========== API 呼叫函數 ==========
  
  const loadExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('載入花費記錄失敗:', error);
    }
  };

  const loadPackingList = async () => {
    try {
      const response = await fetch(`${API_URL}/packing`);
      const data = await response.json();
      setPackingList(data);
    } catch (error) {
      console.error('載入行李清單失敗:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('載入統計資料失敗:', error);
    }
  };

  // 熱門國家列表
  const countries = [
    { name: '日本', code: 'JP', lat: 35.6762, lon: 139.6503, currency: 'JPY', emoji: '🇯🇵' },
    { name: '韓國', code: 'KR', lat: 37.5665, lon: 126.9780, currency: 'KRW', emoji: '🇰🇷' },
    { name: '泰國', code: 'TH', lat: 13.7563, lon: 100.5018, currency: 'THB', emoji: '🇹🇭' },
    { name: '新加坡', code: 'SG', lat: 1.3521, lon: 103.8198, currency: 'SGD', emoji: '🇸🇬' },
    { name: '美國', code: 'US', lat: 40.7128, lon: -74.0060, currency: 'USD', emoji: '🇺🇸' },
    { name: '英國', code: 'GB', lat: 51.5074, lon: -0.1278, currency: 'GBP', emoji: '🇬🇧' },
    { name: '法國', code: 'FR', lat: 48.8566, lon: 2.3522, currency: 'EUR', emoji: '🇫🇷' },
    { name: '澳洲', code: 'AU', lat: -33.8688, lon: 151.2093, currency: 'AUD', emoji: '🇦🇺' },
  ];

  const fetchWeatherAndExchange = async (country) => {
    setLoading(true);
    setSelectedCountry(country);
    
    try {
      // 取得天氣資料
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${country.lat}&lon=${country.lon}&appid=demo&units=metric&lang=zh_tw`
      );
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      // 取得匯率資料
      const exchangeRes = await fetch(
        `https://api.exchangerate-api.com/v4/latest/TWD`
      );
      const exchangeData = await exchangeRes.json();
      setExchange(exchangeData.rates[country.currency]);
    } catch (error) {
      console.error('API 錯誤:', error);
      setWeather({ main: { temp: 25 }, weather: [{ description: '晴天' }] });
      setExchange(0.25);
    }
    
    setLoading(false);
  };

  // 分頁 1: 世界地圖
  const MapTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🌍 探索世界</h2>
        <p className="opacity-90">點擊國家查看即時天氣與匯率</p>
        {stats && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{stats.total_trips}</div>
              <div className="text-sm opacity-80">總旅行次數</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.total_days}</div>
              <div className="text-sm opacity-80">總旅行天數</div>
            </div>
            <div>
              <div className="text-3xl font-bold">${stats.total_cost || 0}</div>
              <div className="text-sm opacity-80">總花費</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {countries.map((country) => (
          <button
            key={country.code}
            onClick={() => fetchWeatherAndExchange(country)}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-400"
          >
            <div className="text-3xl mb-2">{country.emoji}</div>
            <div className="font-semibold">{country.name}</div>
          </button>
        ))}
      </div>

      {selectedCountry && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="text-blue-500" />
            {selectedCountry.name} 資訊
          </h3>
          
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="text-yellow-500" />
                  <h4 className="font-semibold">即時天氣</h4>
                </div>
                {weather && (
                  <div>
                    <p className="text-3xl font-bold">{Math.round(weather.main?.temp || 25)}°C</p>
                    <p className="text-gray-600">{weather.weather?.[0]?.description || '晴天'}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-green-500" />
                  <h4 className="font-semibold">即時匯率</h4>
                </div>
                {exchange && (
                  <div>
                    <p className="text-2xl font-bold">1 TWD = {exchange.toFixed(4)} {selectedCountry.currency}</p>
                    <p className="text-gray-600">1 {selectedCountry.currency} ≈ {(1/exchange).toFixed(2)} TWD</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // 分頁 2: 花費記錄
  const ExpenseTab = () => {
    const [form, setForm] = useState({ country: '', days: '', cost: '', note: '' });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
      if (!form.country || !form.days || !form.cost) {
        alert('請填寫必填欄位');
        return;
      }

      setSaving(true);
      try {
        if (editId !== null) {
          // 更新
          await fetch(`${API_URL}/expenses/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          });
        } else {
          // 新增
          await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          });
        }
        
        await loadExpenses();
        await loadStats();
        setForm({ country: '', days: '', cost: '', note: '' });
        setEditId(null);
      } catch (error) {
        console.error('儲存失敗:', error);
        alert('儲存失敗，請稍後再試');
      }
      setSaving(false);
    };

    const handleEdit = (item) => {
      setForm({ 
        country: item.country, 
        days: item.days.toString(), 
        cost: item.cost.toString(), 
        note: item.note || '' 
      });
      setEditId(item.id);
    };

    const handleDelete = async (id) => {
      if (!confirm('確定要刪除這筆記錄嗎?')) return;
      
      try {
        await fetch(`${API_URL}/expenses/${id}`, {
          method: 'DELETE'
        });
        await loadExpenses();
        await loadStats();
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗，請稍後再試');
      }
    };

    const totalCost = expenses.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={32} />
            <h2 className="text-2xl font-bold">💰 旅遊花費記錄</h2>
          </div>
          <p className="text-3xl font-bold mt-2">總花費: ${totalCost}</p>
          {expenses.length > 0 && (
            <p className="mt-2 opacity-90">平均每次旅行: ${(totalCost / expenses.length)}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="國家 *"
              value={form.country}
              onChange={(e) => setForm({...form, country: e.target.value})}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <input
              type="number"
              placeholder="天數 *"
              value={form.days}
              onChange={(e) => setForm({...form, days: e.target.value})}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <input
              type="number"
              placeholder="花費 (TWD) *"
              value={form.cost}
              onChange={(e) => setForm({...form, cost: e.target.value})}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <input
              type="text"
              placeholder="備註"
              value={form.note}
              onChange={(e) => setForm({...form, note: e.target.value})}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSubmit} 
              disabled={saving}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? '儲存中...' : (
                <>
                  {editId !== null ? <Edit2 size={16} /> : <Plus size={16} />}
                  {editId !== null ? '更新記錄' : '新增記錄'}
                </>
              )}
            </button>
            {editId !== null && (
              <button 
                onClick={() => {
                  setForm({ country: '', days: '', cost: '', note: '' });
                  setEditId(null);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2"
              >
                <X size={16} /> 取消編輯
              </button>
            )}
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>還沒有任何旅行記錄，開始新增吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <span className="text-2xl mr-2">📍</span>
                      <span className="font-semibold">{item.country}</span>
                    </div>
                    <div className="text-gray-600">{item.days} 天</div>
                    <div className="font-bold text-green-600">${parseFloat(item.cost)}</div>
                    <div className="text-gray-500">{item.note || '-'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"
                      title="編輯"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                      title="刪除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 分頁 3: 行李清單
  const PackingTab = () => {
    const [form, setForm] = useState({ item: '', category: 'general' });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const categories = {
      general: '🎒 通用物品',
      hot: '☀️ 熱帶氣候',
      cold: '❄️ 寒冷氣候',
      beach: '🏖️ 海邊度假',
    };

    const handleSubmit = async () => {
      if (!form.item) {
        alert('請輸入物品名稱');
        return;
      }

      setSaving(true);
      try {
        if (editId !== null) {
          // 更新
          await fetch(`${API_URL}/packing/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          });
        } else {
          // 新增
          await fetch(`${API_URL}/packing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          });
        }
        
        await loadPackingList();
        setForm({ item: '', category: 'general' });
        setEditId(null);
      } catch (error) {
        console.error('儲存失敗:', error);
        alert('儲存失敗，請稍後再試');
      }
      setSaving(false);
    };

    const handleToggle = async (id) => {
      try {
        await fetch(`${API_URL}/packing/${id}/toggle`, {
          method: 'PATCH'
        });
        await loadPackingList();
      } catch (error) {
        console.error('更新失敗:', error);
      }
    };

    const handleEdit = (item) => {
      setForm({ item: item.item, category: item.category });
      setEditId(item.id);
    };

    const handleDelete = async (id) => {
      if (!confirm('確定要刪除這個項目嗎?')) return;
      
      try {
        await fetch(`${API_URL}/packing/${id}`, {
          method: 'DELETE'
        });
        await loadPackingList();
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗，請稍後再試');
      }
    };

    const checkedCount = packingList.filter(item => item.checked).length;
    const progress = packingList.length > 0 ? (checkedCount / packingList.length) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">🧳 行李清單</h2>
          <p className="opacity-90">準備好你的旅行必需品</p>
          {packingList.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <span>完成進度</span>
                <span className="font-bold">{checkedCount} / {packingList.length}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="物品名稱 *"
              value={form.item}
              onChange={(e) => setForm({...form, item: e.target.value})}
              className="border rounded px-3 py-2 md:col-span-2 focus:ring-2 focus:ring-purple-400 outline-none"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
            >
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? '儲存中...' : (
                <>
                  {editId !== null ? <Edit2 size={16} /> : <Plus size={16} />}
                  {editId !== null ? '更新物品' : '新增物品'}
                </>
              )}
            </button>
            {editId !== null && (
              <button 
                onClick={() => {
                  setForm({ item: '', category: 'general' });
                  setEditId(null);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2"
              >
                <X size={16} /> 取消編輯
              </button>
            )}
          </div>
        </div>

        {packingList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>還沒有任何行李項目，開始新增吧！</p>
          </div>
        ) : (
          Object.entries(categories).map(([catKey, catLabel]) => {
            const items = packingList.filter(item => item.category === catKey);
            if (items.length === 0) return null;
            
            return (
              <div key={catKey} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                  <span>{catLabel}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {items.filter(i => i.checked).length} / {items.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => handleToggle(item.id)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {item.checked && <Check size={16} className="text-white" />}
                        </button>
                        <span className={`transition-all ${item.checked ? 'line-through text-gray-400' : ''}`}>
                          {item.item}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(item)} 
                          className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"
                          title="編輯"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                          title="刪除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 導航列 */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">✈️ 旅遊工具箱</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'map' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <MapPin size={18} /> 世界地圖
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'expense' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <DollarSign size={18} /> 花費記錄
              </button>
              <button
                onClick={() => setActiveTab('packing')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'packing' ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <Package size={18} /> 行李清單
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'map' && <MapTab />}
        {activeTab === 'expense' && <ExpenseTab />}
        {activeTab === 'packing' && <PackingTab />}
      </main>
    </div>
  );
};

export default TravelToolApp;