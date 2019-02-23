var budgetController = (function(){
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calcPercentage = function(totalInc){
        if(totalInc > 0){
            this.percentage = Math.round((this.value / totalInc) * 100);
        }else{
            this.percentage = -1;
        }
    }

    Expenses.prototype.getPercentage = function(){
        return this.percentage;
    }

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
        },
        budget: 0,
        percentage: -1
    }

    var calcTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(ele){
            sum = sum + ele.value;
        });
        data.totals[type] = sum;
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

        deleteItem: function(type,id){
            var ids, index;
            ids = data.allItems[type].map(function(ele){
                return ele.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },

        calcBudget: function(){
            //Calculate total income and expenses
            calcTotal('inc');
            calcTotal('exp');

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentage: function(){
            data.allItems.exp.forEach(function(ele){
                ele.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function(){
            var allPerc;
            allPerc = data.allItems.exp.map(function(ele){
                return ele.percentage;
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
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
        addDesc: '.add__description',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
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
            newHtml = newHtml.replace('%id%',type+'-'+obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value);

            if(type === 'exp'){
                var percentage = '50%';
                newHtml = newHtml.replace('%percentage%',percentage);
            }

            //Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteItem: function(id){
            var ele;
            ele  = document.querySelector('#' + id);
            ele.parentNode.removeChild(ele);

        },

        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if(obj.totalInc > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        diplayPercentage: function(percentages){
            var fields, nodeListForEach;
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function(list, callback){
                for(var i=0;i<list.length;i++){
                    callback(list[i],i);
                }
            };
            
            nodeListForEach(fields,function(ele,index){
                if(percentages[index] > 0){
                    ele.textContent = percentages[index] + '%';    
                }else{
                    ele.textContent = '---';
                } 
            });
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

    var setEventListener = function(){
        document.querySelector(UICtrl.getDOMstrings().addBtn).addEventListener('click',cntrlAddItem);
        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                cntrlAddItem();
            }
        });
        document.querySelector(UICtrl.getDOMstrings().container).addEventListener('click',cntrlDeleteItem);
    }

    var cntrlAddItem = function(){
        var input, newItem;
        input = UICtrl.getInputData();
        if(input.desc!=="" && !isNaN(input.val) && input.val > 0){
            newItem = budgtCtrl.addItem(input.type,input.desc,input.val);
            UICtrl.addItemList(newItem,input.type);
            UICtrl.clearList();
            updateBudget();
            updatePercetages();
        } 
    };

    var cntrlDeleteItem = function(event){
        var target, parent, splitId, type, id;
        target = event.target;
        parent = target.parentNode.parentNode.parentNode.parentNode.id;
        splitId = parent.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);

        // 1) Delete the item from the data structure in Budget Controller
        budgtCtrl.deleteItem(type,id);

        // 2) Delete the item from the item list in UI Controller
        UICtrl.deleteItem(parent);

        // 3) Update the Budget
        updateBudget();

        // 4) Update percentages
        updatePercetages();
    }

    var updateBudget = function(){
        var budget;
        //Calculate the budget
        budgtCtrl.calcBudget();
        //Return the budget
        budget = budgtCtrl.getBudget();
        //Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercetages = function(){
        // 1) Calculate the percentages
        budgtCtrl.calculatePercentage();
        // 2) Get percentages
        var allPerc = budgtCtrl.getPercentage()
        // 3) Update percentages in UI
        UICtrl.diplayPercentage(allPerc);
    }

    return {
        init: function(){
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setEventListener()
        }
    }
   
})(budgetController,UIControler);

AppControler.init();