# 資料庫模型
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Expense(db.Model):
    """旅遊花費記錄"""
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(100), nullable=False)
    days = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    note = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'country': self.country,
            'days': self.days,
            'cost': self.cost,
            'note': self.note,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class PackingItem(db.Model):
    """行李清單"""
    __tablename__ = 'packing_items'
    
    id = db.Column(db.Integer, primary_key=True)
    item = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # general, hot, cold, beach
    checked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item': self.item,
            'category': self.category,
            'checked': self.checked,
            'created_at': self.created_at.isoformat()
        }