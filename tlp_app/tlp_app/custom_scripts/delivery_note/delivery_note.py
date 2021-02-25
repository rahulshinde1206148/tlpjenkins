from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

def on_submit(doc, method = None):
    # Massage after save for delivery note
    frappe.msgprint("Please make sales invoice.")