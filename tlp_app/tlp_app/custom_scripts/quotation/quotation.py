from __future__ import unicode_literals
from frappe.model.document import Document
import frappe
from six import string_types


@frappe.whitelist()
def get_print_details(template_name):
	letter_detail = frappe.get_doc("Letter Detail Template", template_name)
	if letter_detail.response:
		return letter_detail.response

@frappe.whitelist()
def get_notes_details(template_name):
	note_detail = frappe.get_doc("Notes Template", template_name)
	if note_detail.notes and note_detail.disabled == 0:
		return note_detail.notes
		