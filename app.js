var budgetController = (function(){
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Incomes = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    }

    return {
        addItem: function(type, desc, val){
            var ID, newItem;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            if(type === 'inc'){
                newItem = new Incomes(ID,desc,val);
            }else{
                newItem = new Expenses(ID,desc,val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        testing: function(){
            console.log(data);
        }
    }

})();

var UIControler = (function(){
    var DOMstrings = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        addBtn: '#add__btn',
        addValue: '.add__value',
        addDesc: '.add__description'
    }
    return {

        getInputData : function(){
            return {
                type: document.querySelector(DOMstrings.type).value,
                desc: document.querySelector(DOMstrings.description).value,
                val:  parseFloat(document.querySelector(DOMstrings.value).value)
            }
        },

        getDOMstrings: function(){
            return DOMstrings;
        },

        addItemList: function(obj, type){
            var newHtml, element;

            //Create html string with actual data
            if(type === 'inc'){
                element = '.income__list';
                newHtml = '<div class="item clearfix" id="%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
                element = '.expenses__list';
                newHtml = '<div class="item clearfix" id="%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //Replace placeholder text with actual data
            newHtml = newHtml.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value);

            if(type === 'exp'){
                var percentage = '50%';
                newHtml = newHtml.replace('%percentage%',percentage);
            }

            //Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        clearList: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.addValue + ',' + DOMstrings.addDesc);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value="";
            });

            fieldsArray[0].focus();
        }
    };
})();

var AppControler = (function(budgtCtrl, UICtrl){
    var init = function(){
        var cntrlAddItem = function(){
            var input, newItem;
            input = UICtrl.getInputData();
            if(input.desc!=="" && !isNaN(input.val) && input.val > 0){
                newItem = budgtCtrl.addItem(input.type,input.desc,input.val);
                UICtrl.addItemList(newItem,input.type);
                UICtrl.clearList();
            } 
        };
        document.querySelector(UICtrl.getDOMstrings().addBtn).addEventListener('click',cntrlAddItem);
        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                cntrlAddItem();
            }
        });
    };

    return {
        initialize: init
    }
   
})(budgetController,UIControler);

AppControler.initialize();