from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

def validate(doc, method = None):
    # Code to validate delivery note assigned for sales invoice items
    for i in doc.items:
        if not i.delivery_note:
            frappe.throw("Please take items from delivery note.")