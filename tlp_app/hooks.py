# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "tlp_app"
app_title = "Tlp App"
app_publisher = "Indictrans"
app_description = "Transmission Line Products"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "anu@gmail.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/tlp_app/css/tlp_app.css"
# app_include_js = "/assets/tlp_app/js/tlp_app.js"

# include js, css files in header of web template
# web_include_css = "/assets/tlp_app/css/tlp_app.css"
# web_include_js = "/assets/tlp_app/js/tlp_app.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
    "Quotation": 'tlp_app/custom_scripts/quotation/quotation.js',
    "Item": 'tlp_app/custom_scripts/item/item.js'
}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "tlp_app.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "tlp_app.install.before_install"
# after_install = "tlp_app.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "tlp_app.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
    "BOM":{
        "autoname" : "tlp_app.tlp_app.custom_scripts.bom.bom.autoname",
		"on_submit" : "tlp_app.tlp_app.custom_scripts.bom.bom.on_submit",
		"on_update_after_submit" : "tlp_app.tlp_app.custom_scripts.bom.bom.on_update_after_submit"
	},
	"Purchase Invoice":{
		"validate" : "tlp_app.tlp_app.custom_scripts.purchase_invoice.purchase_invoice.validate",
	}
	

}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"tlp_app.tasks.all"
# 	],
# 	"daily": [
# 		"tlp_app.tasks.daily"
# 	],
# 	"hourly": [
# 		"tlp_app.tasks.hourly"
# 	],
# 	"weekly": [
# 		"tlp_app.tasks.weekly"
# 	]
# 	"monthly": [
# 		"tlp_app.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "tlp_app.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "tlp_app.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "tlp_app.task.get_dashboard_data"
# }
fixtures = ['Custom Field', 'Property Setter', 'Print Format', 'Role', 'Terms and Conditions']

