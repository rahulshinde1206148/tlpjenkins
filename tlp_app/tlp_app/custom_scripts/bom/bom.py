from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

def on_submit(doc, method = None):
	if doc.is_default_assembly:
		print("/////////on on_submit", on_submit)
		manage_default_assembly()

def on_update_after_submit(doc, method = None):
	if doc.is_default_assembly:
		print("/////////on on_update_after_submit", on_update_after_submit)
		manage_default_assembly()

def manage_default_assembly():
	existed_default_assembly = frappe.db.get_value("BOM", {'is_default_assembly':1}, 'name')
	if existed_default_assembly:
		frappe.db.set_value("BOM", existed_default_assembly,'is_default_assembly', 0 )
	else:
		pass