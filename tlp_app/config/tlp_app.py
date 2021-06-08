from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _(" "),
			"icon": "fa fa-star",
			"items": [
				{
					"type": "doctype",
					"name": "Cost Sheet",
					"description": _("Cost Sheet"),
					"onboard": 1
				}
			]
				
		}
	]