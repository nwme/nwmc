# Northwest Money Exchange Converter Widget

This is a responsive, drop-in widget to use in your own site. It is restylable and will adjust into a given space, however we recommend giving the widget a container at least 200px wide.

If you wish to restyle the widget, be sure to keep our logo in place.

## Widget actions

### Quickstart

To get going simply copy the below snippet into your html and the widget will autoload into the provided div.

    <div id="nwmc"></div>
    <script src="http://northwestmoneyexchange.com/libraries/widget/nwmc.js.php"></script>

By default, the widget will self intialise using it's default values. Should you wish to use custom values, or inject the widget elsewhere simply declare an object named `nwmc` with the property of `preventAutoInit` set to `true`, and then initialise the widget yourself. For example, you may wish to change the ID of the containing element to "myContainer"

    <div id="myContainer"></div>
    <script>
        nwmc = {preventAutoInit: true}
    </script>
    <script src="http://northwestmoneyexchange.com/libraries/widget/nwmc.js.php"></script>
    <script>
        /* At this point, the script is included but not run... Lets run it with our own options. */
        (function customInit(){
            var options = {elementId: 'myContainer'};
            var widget = nwmc.widget(options);
            widget.init();
            window.onresize = widget.adjust;
        })();
    </script>

If you're using jQuery in your page already, you may wish to assign the widget.adjust method using `$(window).resize(widget.adjust);` instead of the usual onresize to take advantage of the handler queueing jQuery gives you.

Custom parameters you can inject using the options object are:

    elementId   The id of your container element(default is 'nwmc')
    stylesheet  The stylesheet to inject, or false for no style (default is 'http://northwestmoneyexchange.com/libraries/nwme_ratesupdater/widget/nwmc.css')
    widthSmall  The width at which the class of nwmc--small will be added to the container (default is 500)
    widthTiny   The width at which the class of nwmc--tiny will be added to the container (default is 300)


