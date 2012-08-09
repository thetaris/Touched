<touched><div class="arg" id="box-0" data-name="start" data-type="l.system"><div class="box element" data-type="l.system" id="box-29"><div class="box-text keyword">L-System</div><div class="box-text">iterations:</div><div class="arg" id="box-21" data-name="iterations" data-type="number"><div class="box-text box" data-type="number" id="box-44">1000</div></div><div class="box-text">start:</div><div class="arg" id="box-22" data-name="axiom" data-type="l.op.variable"><div class="box element selected" data-type="l.op.variable" id="box-58"><div class="box-text keyword">Var</div><div class="arg" id="box-43" data-name="name" data-type="text"><div class="box-text box" data-type="text" id="box-82">T</div></div></div></div><div class="box-text">color:</div><div class="arg" id="box-31" data-name="stroke" data-type="color"><div class="box-text box" data-type="color" id="box-86">#000000</div></div><div class="group box-body" data-repeat="*" id="box-87"><div class="arg" id="box-38" data-name="rule" data-type="l.rule"><div class="box element" data-type="l.rule" id="box-88"><div class="box-text keyword">Rule</div><div class="arg" id="box-41" data-name="in" data-type="l.op.variable"><div class="box element" data-type="l.op.variable" id="box-89"><div class="box-text keyword">Var</div><div class="arg" id="box-52" data-name="name" data-type="text"><div class="box-text box" data-type="text" id="box-90">T</div></div></div></div><div class="box-text">-&gt;</div><div class="group box-body" data-repeat="*" id="box-91"><div class="arg" id="box-56" data-name="out" data-type="l.op"><div class="box element" data-type="l.op.group" id="box-92"><div class="box-text keyword">Group</div><div class="group box-body" data-repeat="*" id="box-93"><div class="arg" id="box-72" data-name="child" data-type="l.op"><div class="box element" data-type="l.op.variable" id="box-94"><div class="box-text keyword">Var</div><div class="arg" id="box-57" data-name="name" data-type="text"><div class="box-text box" data-type="text" id="box-95">S</div></div></div></div></div></div></div><div class="arg" id="box-55" data-name="out" data-type="l.op"><div class="box element" data-type="l.op.group" id="box-96"><div class="box-text keyword">Group</div><div class="group box-body" data-repeat="*" id="box-97"><div class="arg" id="box-75" data-name="child" data-type="l.op"><div class="box element" data-type="l.op.color" id="box-98"><div class="box-text keyword">Color</div><div class="arg" id="box-66" data-name="color" data-type="color"><div class="box-text box" data-type="color" id="box-99">red</div></div></div></div><div class="arg" id="box-63" data-name="child" data-type="l.op"><div class="box element" data-type="l.op.variable" id="box-100"><div class="box-text keyword">Var</div><div class="arg" id="box-61" data-name="name" data-type="text"><div class="box-text box" data-type="text" id="box-101">S</div></div></div></div></div></div></div><div class="arg" id="box-53" data-name="out" data-type="l.op"><div class="box element" data-type="l.op.group" id="box-102"><div class="box-text keyword">Group</div><div class="group box-body" data-repeat="*" id="box-103"><div class="arg" id="box-78" data-name="child" data-type="l.op"><div class="box element" data-type="l.op.color" id="box-104"><div class="box-text keyword">Color</div><div class="arg" id="box-81" data-name="color" data-type="color"><div class="box-text box" data-type="color" id="box-105">blue</div></div></div></div><div class="arg" id="box-59" data-name="child" data-type="l.op"><div class="box element" data-type="l.op.variable" id="box-106"><div class="box-text keyword">Var</div><div class="arg" id="box-85" data-name="name" data-type="text"><div class="box-text box" data-type="text" id="box-107">S</div></div></div></div></div></div></div></div></div></div><div class="arg" id="box-33" data-name="rule" data-type="l.rule"><div class="box element" data-type="l.rule" id="box-108" style="top: 88.55575561523438px; left: 46.555572509765625px; "><div class="box-text keyword">Rule</div><div class="arg" id="box-50" data-name="in" data-type="l.op.variable"><div class="box element" data-type="l.op.variable" id="box-109"><div class="box-text keyword">Var</div><div class="arg" id="box-54" data-name="name" data-type="text"><div class="box-text box" data-type="text" id="box-110">S</div></div></div></div><div class="box-text">-&gt;</div><div class="group box-body" data-repeat="*" id="box-111"><div data-type="l.op" data-name="out" id="box-1" class="arg"></div><div data-type="l.op" data-name="out" id="box-4" class="arg"><div class="box element" data-type="l.op.move" id="box-112"><div class="box-text keyword">Move</div><div class="arg" id="box-8" data-name="length" data-type="number|math.random"><div class="box-text box" data-type="number" id="box-113">1</div></div></div></div><div data-type="l.op" data-name="out" id="box-3" class="arg"></div><div data-type="l.op" data-name="out" id="box-5" class="arg"></div><div data-type="l.op" data-name="out" id="box-2" class="arg"></div><div class="arg" id="box-64" data-name="out" data-type="l.op"><div class="box element" data-type="l.op.rotate" id="box-114"><div class="box-text keyword">Rotate</div><div class="arg" id="box-13" data-name="angle" data-type="number|math.random"><div class="box-text box" data-type="number" id="box-115">90</div></div></div></div><div class="arg" id="box-9" data-name="out" data-type="l.op"><div class="box element" data-type="l.op.move" id="box-116"><div class="box-text keyword">Move</div><div class="arg" id="box-17" data-name="length" data-type="number|math.random"><div class="box element" data-type="math.random" id="box-117"><div class="box-text">random(</div><div class="arg" id="box-20" data-name="min" data-type="number"><div class="box-text box" data-type="number" id="box-118">-10</div></div><div class="box-text">,</div><div class="arg" id="box-23" data-name="max" data-type="number"><div class="box-text box" data-type="number" id="box-119">10</div></div><div class="box-text">)</div></div></div></div></div><div class="arg" id="box-14" data-name="out" data-type="l.op"><div class="box element" data-type="l.op.rotate" id="box-120"><div class="box-text keyword">Rotate</div><div class="arg" id="box-28" data-name="angle" data-type="number|math.random"><div class="box-text box" data-type="number" id="box-121">-90</div></div></div></div><div class="arg" id="box-25" data-name="out" data-type="l.op"><div class="box element" data-type="l.op.variable" id="box-122"><div class="box-text keyword">Var</div><div class="arg" id="box-37" data-name="name" data-type="text"><div class="box-text box" data-type="text" id="box-123">S</div></div></div></div></div></div></div></div></div></div></touched>