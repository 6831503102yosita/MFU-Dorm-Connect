'use strict';
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

const VALID_CATEGORIES = ['Electrical', 'Plumbing', 'Furniture', 'Internet', 'Other'];
const VALID_STATUSES = ['pending', 'progress', 'done'];

function nextTicketId() {
  const row = db.prepare('SELECT value FROM ticket_counter WHERE id = 1').get();
  const ticketId = row.value + 1;
  db.prepare('UPDATE ticket_counter SET value = ? WHERE id = 1').run(ticketId);
  return ticketId;
}

function listRepairs(req, res) {
  try {
    const repairs = db.prepare('SELECT * FROM repair_requests WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const parsed = repairs.map(r => ({ ...r, photo_urls: JSON.parse(r.photo_urls) }));
    return res.json({ repairs: parsed });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch repairs' });
  }
}

function getRepair(req, res) {
  try {
    const repair = db.prepare('SELECT * FROM repair_requests WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!repair) return res.status(404).json({ error: 'Repair not found' });
    return res.json({ repair: { ...repair, photo_urls: JSON.parse(repair.photo_urls) } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch repair' });
  }
}

function createRepair(req, res) {
  try {
    const { category, description } = req.body;
    if (!category || !description) {
      return res.status(400).json({ error: 'Category and description are required' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    if (description.trim().length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters' });
    }

    const photoUrls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const id = uuidv4();
    const ticketId = nextTicketId();
    const user = req.user;

    db.prepare(`
      INSERT INTO repair_requests (id, ticket_id, user_id, category, description, status, photo_urls)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `).run(id, ticketId, user.id, category, description.trim(), JSON.stringify(photoUrls));

    const notifId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title_en, title_th, body_en, body_th)
      VALUES (?, ?, 'rep', ?, ?, ?, ?)
    `).run(notifId, user.id,
      `Repair Ticket #${ticketId} Submitted`,
      `ส่งคำขอซ่อม #${ticketId} แล้ว`,
      `Your ${category} repair request (Ticket #${ticketId}) in room ${user.dorm_building}-${user.room_number} has been submitted.`,
      `คำขอซ่อม ${category} (ตั๋ว #${ticketId}) ห้อง ${user.dorm_building}-${user.room_number} ถูกส่งแล้ว`
    );

    const repair = db.prepare('SELECT * FROM repair_requests WHERE id = ?').get(id);
    return res.status(201).json({ repair: { ...repair, photo_urls: JSON.parse(repair.photo_urls) } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create repair request' });
  }
}

function updateRepairStatus(req, res) {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const repair = db.prepare('SELECT * FROM repair_requests WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!repair) return res.status(404).json({ error: 'Repair not found' });

    db.prepare("UPDATE repair_requests SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);

    const statusLabels = { progress: { en: 'In Progress', th: 'กำลังดำเนินการ' }, done: { en: 'Completed', th: 'เสร็จสิ้น' } };
    if (statusLabels[status]) {
      const notifId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title_en, title_th, body_en, body_th)
        VALUES (?, ?, 'rep', ?, ?, ?, ?)
      `).run(notifId, req.user.id,
        `Repair #${repair.ticket_id} ${statusLabels[status].en}`,
        `งานซ่อม #${repair.ticket_id} ${statusLabels[status].th}`,
        `Your repair ticket #${repair.ticket_id} status has been updated to ${statusLabels[status].en}.`,
        `ตั๋วซ่อม #${repair.ticket_id} อัปเดตเป็น ${statusLabels[status].th}`
      );
    }

    const updated = db.prepare('SELECT * FROM repair_requests WHERE id = ?').get(req.params.id);
    return res.json({ repair: { ...updated, photo_urls: JSON.parse(updated.photo_urls) } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update repair' });
  }
}

function deleteRepair(req, res) {
  try {
    const result = db.prepare('DELETE FROM repair_requests WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Repair not found' });
    return res.json({ message: 'Repair deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete repair' });
  }
}

module.exports = { listRepairs, getRepair, createRepair, updateRepairStatus, deleteRepair };
