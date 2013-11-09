var state = {
    hideRC: false,
    timezone: null
};

var eventHandlers = {
    dealWithRecentChanges: function(event) {
        // If we have event, thne we only have to do a single row.  Else we're doing the whole lot.
        var $node,
            $user;

        if (event)
        {
            $node = $(event.target);
            $user = $node.find(".user[title='~Spacenet@unaffiliated/windpower/bot/spacenet']");
        }
        else
        {
            $user = $(".user[title='~Spacenet@unaffiliated/windpower/bot/spacenet']");
        }

        $user.each(function(i, message){
            $message = $(message).parent().parent();
            $row = $message.parent();

            // Blam an RC, murderize it.
            if ($message.text().match(/<.+?>\s\[RC\]/))
            {
                if (state.hideRC)
                {
                    $row.hide();
                }
                else
                {
                    $row.show();
                }
            }
        });
    },
    dealWithTimestamps: function(event) {
        // If we have event, thne we only have to do a single row.  Else we're doing the whole lot.
        var $node,
            $date;

        if (event)
        {
            $node = $(event.target);
            $date = $node.find(".date");
        }
        else
        {
            $date = $(".date");
        }

        $date.each(function(i, elem){
            var $elem = $(elem),
                time = moment($elem.attr("title") + " -0500");

            $elem.find('a').text(state.timezone ?
                time.tz(state.timezone).format("YYYY-MM-DD HH:mm:ss") :
                time.format("YYYY-MM-DD HH:mm:ss")
            );
        });
    },
    toggleRc: function(event) {
        var target = event.currentTarget ? event.currentTarget : event;

        state.hideRC = !state.hideRC;
        if (state.hideRC)
        {
            target.textContent = "Show RCs";
        }
        else
        {
            target.textContent = "Hide RCs";
        }

        eventHandlers.dealWithRecentChanges();
    },
    contentChanged: function(event) {
        eventHandlers.dealWithRecentChanges(event);
        eventHandlers.dealWithTimestamps(event);
    },
    changeTimezone: function(event) {
        state.timezone = event.currentTarget.value;
        eventHandlers.dealWithTimestamps();
    }
};

var inputs = {
    toggleRC: function ($parent) {
        $button = $("<button>Hide RCs</button>", { class: "biringapls button", id: "toggle-rc", text: "Hide RCs" });
        $button.css({
            display: "inline-block",
            width: "120px",
            height: "20px"
        });
        $button.click(eventHandlers.toggleRc);

        return $button;
    },
    changeTimezone: function ($parent) {
        $select = $("<select>", {
            class: "biringapls select",
            id: "change-timezone",
            text: "Select timezone"
        });
        $select.css({
            display: "inline-block",
            width: "120px",
            height: "20px"
        });
        $select.append($("<option>", {
            value: "",
            text: "System timezone"
        }));

        // Add options
        Object.keys(moment_timezone_data["links"]).forEach(function(k){
            $select.append($("<option>", {
                value: moment_timezone_data["links"][k],
                text: k
            }));
        });

        $select.change(eventHandlers.changeTimezone);

        return $select;
    },
    init: function(){
        $buttonBar = $("<div>", { class: "biringapls button-bar"});
        $buttonBar.css({
            width: "100%",
            height: "20px",
            display: "block"
        });

        // Add button bar
        $("body").prepend($buttonBar);

        // Move h1 to button bar, otherwise things look silly.
        $h1 = $("h1");
        $h1.appendTo($buttonBar);
        $h1.css({
            display: "inline-block",
            padding: "0 1em"
        });

        // Add buttons
        $buttonBar.append(inputs.toggleRC());
        $buttonBar.append(inputs.changeTimezone());
    }
};

$(document).ready(function() {

// Find out when stuffs changed
    $("#content").bind("DOMNodeInserted", eventHandlers.contentChanged);

    // Add a buttons!
    inputs.init();
});