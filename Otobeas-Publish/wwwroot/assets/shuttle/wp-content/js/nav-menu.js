﻿!function (e) { var n = {}; function t(o) { if (n[o]) return n[o].exports; var r = n[o] = { i: o, l: !1, exports: {} }; return e[o].call(r.exports, r, r.exports, t), r.l = !0, r.exports } t.m = e, t.c = n, t.d = function (e, n, o) { t.o(e, n) || Object.defineProperty(e, n, { enumerable: !0, get: o }) }, t.r = function (e) { "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 }) }, t.t = function (e, n) { if (1 & n && (e = t(e)), 8 & n) return e; if (4 & n && "object" == typeof e && e && e.__esModule) return e; var o = Object.create(null); if (t.r(o), Object.defineProperty(o, "default", { enumerable: !0, value: e }), 2 & n && "string" != typeof e) for (var r in e) t.d(o, r, function (n) { return e[n] }.bind(null, r)); return o }, t.n = function (e) { var n = e && e.__esModule ? function () { return e.default } : function () { return e }; return t.d(n, "a", n), n }, t.o = function (e, n) { return Object.prototype.hasOwnProperty.call(e, n) }, t.p = "", t(t.s = 0) }([function (e, n) { class t extends elementorModules.frontend.handlers.Base { getDefaultSettings() { return { selectors: { wrapper: ".jeg-elementor-kit.jkit-nav-menu", container: ".jkit-menu-wrapper", open_toggle: ".jkit-hamburger-menu", close_toggle: '.jkit-close-menu, .menu-item:not(.menu-item-has-children) a[href^="#"]', dropdown_toggle: "li.menu-item-has-children > a i", menu_dropdown: "li.menu-item-has-children > a" } } } getDefaultElements() { const e = this.getSettings("selectors"); return { $wrapper: this.$element.find(e.wrapper), $container: this.$element.find(e.container), $open_toggle: this.$element.find(e.open_toggle), $close_toggle: this.$element.find(e.close_toggle), $dropdown_toggle: this.$element.find(e.dropdown_toggle), $menu_dropdown: this.$element.find(e.menu_dropdown) } } bindEvents() { this.onLoadElement() } onLoadElement() { this.addBodyClass(), this.addDropdownIcon(), this.onToogleClick() } addBodyClass() { this.elements.$wrapper.length > 0 && jQuery("body").addClass("jkit-nav-menu-loaded") } addDropdownIcon() { const e = this.elements.$wrapper.data("item-indicator"), n = this.elements.$menu_dropdown, t = this.getSettings("selectors"); n.each((function () { 0 == jQuery(this).find("i").length && jQuery(this).append(e) })), this.elements.$dropdown_toggle = this.$element.find(t.dropdown_toggle) } onToogleClick() { const e = this, n = e.elements.$wrapper, t = e.elements.$menu_dropdown, o = e.elements.$open_toggle, r = e.elements.$close_toggle, l = e.elements.$dropdown_toggle; o.on("click", (function (n) { n.preventDefault(), e.elements.$container.hasClass("active") ? e.elements.$container.removeClass("active") : e.elements.$container.addClass("active") })), r.on("click", (function (n) { n.preventDefault(), e.elements.$container.removeClass("active") })), n.hasClass("submenu-click-title") ? t.each((function () { jQuery(this).on("click", (function (e) { e.preventDefault(); const n = jQuery(this).next(); n.hasClass("dropdown-open") ? n.removeClass("dropdown-open") : n.addClass("dropdown-open") })) })) : l.each((function () { jQuery(this).on("click", (function (e) { e.preventDefault(); const n = jQuery(this).parents("a").next(); n.hasClass("dropdown-open") ? n.removeClass("dropdown-open") : n.addClass("dropdown-open") })) })) } } jQuery(window).on("elementor/frontend/init", (() => { elementorFrontend.hooks.addAction("frontend/element_ready/jkit_nav_menu.default", (e => { elementorFrontend.elementsHandler.addHandler(t, { $element: e }) })) })) }]);