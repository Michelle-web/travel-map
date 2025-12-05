# 主程式
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Expense, PackingItem
import os

app = Flask(__name__)
CORS(app)  # 允許前端跨域請求

# 資料庫設定
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'  # 記得改成隨機字串

db.init_app(app)

# 建立資料庫表格
with app.app_context():
    db.create_all()


# ========== 花費記錄 API ==========

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    """取得所有花費記錄"""
    expenses = Expense.query.order_by(Expense.created_at.desc()).all()
    return jsonify([expense.to_dict() for expense in expenses])


@app.route('/api/expenses', methods=['POST'])
def create_expense():
    """新增花費記錄"""
    data = request.json
    
    try:
        expense = Expense(
            country=data['country'],
            days=int(data['days']),
            cost=float(data['cost']),
            note=data.get('note', '')
        )
        db.session.add(expense)
        db.session.commit()
        return jsonify(expense.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    """更新花費記錄"""
    expense = Expense.query.get_or_404(expense_id)
    data = request.json
    
    try:
        expense.country = data.get('country', expense.country)
        expense.days = int(data.get('days', expense.days))
        expense.cost = float(data.get('cost', expense.cost))
        expense.note = data.get('note', expense.note)
        
        db.session.commit()
        return jsonify(expense.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """刪除花費記錄"""
    expense = Expense.query.get_or_404(expense_id)
    
    try:
        db.session.delete(expense)
        db.session.commit()
        return jsonify({'message': '刪除成功'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/expenses/stats', methods=['GET'])
def get_expense_stats():
    """取得花費統計"""
    expenses = Expense.query.all()
    
    total_cost = sum(e.cost for e in expenses)
    total_days = sum(e.days for e in expenses)
    country_stats = {}
    
    for expense in expenses:
        if expense.country not in country_stats:
            country_stats[expense.country] = {'cost': 0, 'days': 0, 'count': 0}
        country_stats[expense.country]['cost'] += expense.cost
        country_stats[expense.country]['days'] += expense.days
        country_stats[expense.country]['count'] += 1
    
    return jsonify({
        'total_cost': total_cost,
        'total_days': total_days,
        'total_trips': len(expenses),
        'country_stats': country_stats
    })


# ========== 行李清單 API ==========

@app.route('/api/packing', methods=['GET'])
def get_packing_items():
    """取得所有行李項目"""
    category = request.args.get('category')  # 可選：篩選分類
    
    if category:
        items = PackingItem.query.filter_by(category=category).all()
    else:
        items = PackingItem.query.order_by(PackingItem.category, PackingItem.id).all()
    
    return jsonify([item.to_dict() for item in items])


@app.route('/api/packing', methods=['POST'])
def create_packing_item():
    """新增行李項目"""
    data = request.json
    
    try:
        item = PackingItem(
            item=data['item'],
            category=data.get('category', 'general'),
            checked=data.get('checked', False)
        )
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/packing/<int:item_id>', methods=['PUT'])
def update_packing_item(item_id):
    """更新行李項目"""
    item = PackingItem.query.get_or_404(item_id)
    data = request.json
    
    try:
        item.item = data.get('item', item.item)
        item.category = data.get('category', item.category)
        item.checked = data.get('checked', item.checked)
        
        db.session.commit()
        return jsonify(item.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/packing/<int:item_id>', methods=['DELETE'])
def delete_packing_item(item_id):
    """刪除行李項目"""
    item = PackingItem.query.get_or_404(item_id)
    
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': '刪除成功'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/packing/<int:item_id>/toggle', methods=['PATCH'])
def toggle_packing_item(item_id):
    """切換行李項目勾選狀態"""
    item = PackingItem.query.get_or_404(item_id)
    
    try:
        item.checked = not item.checked
        db.session.commit()
        return jsonify(item.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# ========== 健康檢查 ==========

@app.route('/api/health', methods=['GET'])
def health_check():
    """API 健康檢查"""
    return jsonify({'status': 'ok', 'message': '旅遊工具 API 運作正常'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)