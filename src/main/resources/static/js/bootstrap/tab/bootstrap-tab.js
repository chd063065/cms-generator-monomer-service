/**
 * Bootstrap tab组件封装
 * @author linzf
 * @created 2017/8/10
 * @from billjiang
 */
(function ($, window, document, undefined) {
    'use strict';

    var pluginName = 'tabs';

    //入口方法
    $.fn[pluginName] = function (options) {
        var self = $(this);
        if (this == null)
            return null;
        var data = this.data(pluginName);
        if (!data) {
            data = new BaseTab(this, options);
            self.data(pluginName, data);
        }
        return data;
    };


    var BaseTab = function (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, {}, this.default, options);
        this.init();
    }

    //默认配置
    BaseTab.prototype.default = {
        showIndex: 0, //默认显示页索引
        loadAll: true,//true=一次全部加在页面,false=只加在showIndex指定的页面，其他点击时加载，提高响应速度

    }

    //结构模板
    BaseTab.prototype.template = {
        ul_nav: '<ul  class="nav nav-tabs"></ul>',
        ul_li: '<li><a href="#{0}" data-toggle="tab"><span>{1}</span></a></li>',
        ul_li_close: '<i class="fa fa-remove closeable" title="关闭"></i>',
        div_content: '<div  class="tab-content"></div>',
        div_content_panel: '<div class="tab-pane fade" id="{0}"></div>'
    }

    //初始化
    BaseTab.prototype.init = function () {
        if (!this.options.data || this.options.data.length == 0) {
            console.error("请指定tab页数据");
            return;
        }
        //当前显示的显示的页面是否超出索引
        if (this.options.showIndex < 0 || this.options.showIndex > this.options.data.length - 1) {
            console.error("showIndex超出了范围");
            //指定为默认值
            this.options.showIndex = this.default.showIndex;
        }
        //清除原来的tab页
        this.$element.html("");
        this.builder(this.options.data);
    }

    //使用模板搭建页面结构
    BaseTab.prototype.builder = function (data) {
        var ul_nav = $(this.template.ul_nav);
        var div_content = $(this.template.div_content);

        for (var i = 0; i < data.length; i++) {
            //nav-tab
            var ul_li = $(this.template.ul_li.format(data[i].id, data[i].text));
            //如果可关闭,插入关闭图标，并绑定关闭事件
            if (data[i].closeable) {
                var ul_li_close = $(this.template.ul_li_close);

                ul_li.find("a").append(ul_li_close);
                ul_li.find("a").append("&nbsp;");
            }

            ul_nav.append(ul_li);

            //div-content
            var div_content_panel = $(this.template.div_content_panel.format(data[i].id));


            div_content.append(div_content_panel);
        }

        this.$element.append(ul_nav);
        this.$element.append(div_content);
        this.loadData();

        this.$element.find(".nav-tabs li:eq(" + this.options.showIndex + ") a").tab("show");

    }

    BaseTab.prototype.loadData = function () {
        var self = this;

        //tab点击即加载事件
        //设置一个值，记录每个tab页是否加载过
        this.stateObj = {};
        var data = this.options.data;
        //如果是当前页或者配置了一次性全部加载，否则点击tab页时加载
        for (var i = 0; i < data.length; i++) {
            if (this.options.loadAll || this.options.showIndex == i) {
                if (data[i].url) {
                    $("#" + data[i].id).html("<iframe style='width: 100%;height:88%;boxder:none;' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='yes' allowtransparency='yes' src='"+data[i].url+"' ></iframe>");
                    this.stateObj[data[i].id] = true;
                } else {
                    console.error("id=" + data[i].id + "的tab页未指定url");
                    this.stateObj[data[i].id] = false;
                }
            } else {
                this.stateObj[data[i].id] = false;
                (function (id, url) {
                    self.$element.find(".nav-tabs a[href='#" + id + "']").on('show.bs.tab', function () {
                        if (!self.stateObj[id]) {
                            $("#" + id).html("<iframe style='width: 100%;height:88%;boxder:none;' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='yes' allowtransparency='yes' src='"+url+"' ></iframe>");
                            self.stateObj[id] = true;
                        }
                    });
                }(data[i].id, data[i].url))
            }
        }

        //关闭tab事件
        this.$element.find(".nav-tabs li a i.closeable").each(function (index, item) {
            $(item).click(function () {
                var href = $(this).parents("a").attr("href").substring(1);
                if(self.getCurrentTabId()==href){
                    if($(this).parents("a").parents("li").prev().html()!=undefined){
                        var tabId = $(this).parents("a").parents("li").prev().find("a").attr('href').replace('#','');
                        self.$element.find(".nav-tabs li a[href='#" +tabId + "']").tab("show");
                        $('#'+ tabId).addClass("tab-pane fade active in");
                    }else if($(this).parents("a").parents("li").next().html()!=undefined){
                        var tabId = $(this).parents("a").parents("li").next().find("a").attr('href').replace('#','');
                        self.$element.find(".nav-tabs li a[href='#" +tabId + "']").tab("show");
                        $('#'+ tabId).addClass("tab-pane fade active in");
                    }
                   // self.$element.find(".nav-tabs li:eq(0) a").tab("show");
                    // 包含#号的tab的id.
                   // var tabId = self.$element.find(".nav-tabs li:eq(0) a").attr('href').replace('#','');
                   // alert($(this).parents("a").parents("li").prev().html())
                   // $('#'+ tabId).addClass("tab-pane fade active in")
                }
                $(this).parents("li").remove();
                $("#" + href).remove();

            })
        });

    }

    //新增一个tab页
    BaseTab.prototype.addTab=function (obj) {
        var self=this;
        var showObj = this.$element.find(".nav-tabs li a[href='#" + obj.id + "']");
        // 增加一个页面的时候判断当前的标签页是否已经打开过了，若打开过则不再重新生成新的tab标签页，而是直接显示打开过的标签页
        if($(showObj).html()==undefined){
            //nav-tab
            var ul_li = $(this.template.ul_li.format(obj.id, obj.text));
            //如果可关闭,插入关闭图标，并绑定关闭事件
            if (obj.closeable) {
                var ul_li_close = $(this.template.ul_li_close);

                ul_li.find("a").append(ul_li_close);
                ul_li.find("a").append("&nbsp;");
            }

            this.$element.find(".nav-tabs").append(ul_li);
            //div-content
            var div_content_panel = $(this.template.div_content_panel.format(obj.id));
            this.$element.find(".tab-content").append(div_content_panel);
            $("#" + obj.id).html("<iframe style='width: 100%;height:88%;boxder:none;' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='yes' allowtransparency='yes' src='"+obj.url+"' ></iframe>");
            this.stateObj[obj.id] = true;

            if(obj.closeable){
                this.$element.find(".nav-tabs li a[href='#" + obj.id + "'] i.closeable").click(function () {
                    var href = $(this).parents("a").attr("href").substring(1);
                    if(self.getCurrentTabId()==href){
                        if($(this).parents("a").parents("li").prev().html()!=undefined){
                            var tabId = $(this).parents("a").parents("li").prev().find("a").attr('href').replace('#','');
                            self.$element.find(".nav-tabs li a[href='#" +tabId + "']").tab("show");
                            $('#'+ tabId).addClass("tab-pane fade active in");
                        }else if($(this).parents("a").parents("li").next().html()!=undefined){
                            var tabId = $(this).parents("a").parents("li").next().find("a").attr('href').replace('#','');
                            self.$element.find(".nav-tabs li a[href='#" +tabId + "']").tab("show");
                            $('#'+ tabId).addClass("tab-pane fade active in");
                        }
                    }
                    $(this).parents("li").remove();
                    $("#" + href).remove();
                })
            }
        }
        this.$element.find(".nav-tabs a[href='#" + obj.id + "']").tab("show");
    }



    //根据id设置活动tab页
    BaseTab.prototype.showTab=function (tabId) {
        this.$element.find(".nav-tabs li a[href='#" + tabId + "']").tab("show");
    }

    //获取当前活动tab页的ID
    BaseTab.prototype.getCurrentTabId=function () {
        var href=this.$element.find(".nav-tabs li.active a").attr("href");
        href=href.substring(1);
        return href;
    }


    String.prototype.format = function () {
        if (arguments.length == 0) return this;
        for (var s = this, i = 0; i < arguments.length; i++)
            s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return s;
    };
})(jQuery, window, document)