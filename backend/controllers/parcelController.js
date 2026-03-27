'use strict';
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

const VALID_STATUSES = ['scanned', 'notified', 'ready', 'picked', 'returned'];

function listParcels(req, res) {
  try {
    const { history } = req.query;
    let parcels;
    if (history === 'true') {
      parcels = db.prepare("SELECT * FROM parcels WHERE user_id = ? AND status IN ('picked','returned') ORDER BY created_at DESC").all(req.user.id);
    } else if (history === 'false') {
      parcels = db.prepare("SELECT * FROM parcels WHERE user_id = ? AND status NOT IN ('picked','returned') ORDER BY created_at DESC").all(req.user.id);
    } else {
      parcels = db.prepare('SELECT * FROM parcels WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    }
    return res.json({ parcels });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch parcels' });
  }
}

function getParcel(req, res) {
  try {
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!parcel) return res.status(404).json({ error: 'Parcel not found' });
    return res.json({ parcel });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch parcel' });
  }
}

function createParcel(req, res) {
  try {
    const { tracking_number, carrier, location, notes } = req.body;
    if (!tracking_number || !carrier) {
      return res.status(400).json({ error: 'Tracking number and carrier are required' });
    }
    const id = uuidv4();
    db.prepare(`
      INSERT INTO parcels (id, user_id, tracking_number, carrier, status, location, notes)
      VALUES (?, ?, ?, ?, 'scanned', ?, ?)
    `).run(id, req.user.id, tracking_number.trim(), carrier.trim(), location || null, notes || null);

    // Auto-create notification
    const notifId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title_en, title_th, body_en, body_th)
      VALUES (?, ?, 'pkg',
        'Parcel Scanned', 'พัสดุถูกสแกนแล้ว',
        ?, ?)
    `).run(notifId, req.user.id,
      `Your parcel ${tracking_number} from ${carrier} has been scanned. You will be notified when it's ready.`,
      `พัสดุ ${tracking_number} จาก ${carrier} ถูกสแกนแล้ว ระบบจะแจ้งเตือนเมื่อพร้อมรับ`
    );

    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(id);
    return res.status(201).json({ parcel });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create parcel' });
  }
}

function updateParcelStatus(req, res) {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!parcel) return res.status(404).json({ error: 'Parcel not found' });

    db.prepare("UPDATE parcels SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);

    if (status === 'notified') {
      const notifId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title_en, title_th, body_en, body_th)
        VALUES (?, ?, 'pkg', 'Parcel Ready', 'พัสดุพร้อมรับแล้ว', ?, ?)
      `).run(notifId, req.user.id,
        `Your parcel ${parcel.tracking_number} is ready for pickup at the dorm office.`,
        `พัสดุ ${parcel.tracking_number} พร้อมให้รับที่สำนักงานหอพักแล้ว`
      );
    }

    const updated = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);
    return res.json({ parcel: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update parcel' });
  }
}

function deleteParcel(req, res) {
  try {
    const result = db.prepare('DELETE FROM parcels WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Parcel not found' });
    return res.json({ message: 'Parcel deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete parcel' });
  }
}

module.exports = { listParcels, getParcel, createParcel, updateParcelStatus, deleteParcel };
