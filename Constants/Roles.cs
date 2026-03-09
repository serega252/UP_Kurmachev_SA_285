namespace sergey_crud.Constants;

public static class Roles
{
    public const string Manager = "Менеджер";
    public const string Master = "Мастер";
    public const string Operator = "Оператор";
    public const string Client = "Клиент";

    public const string ManagerOrOperator = Manager + "," + Operator;
    public const string ManagerOperatorOrMaster = Manager + "," + Operator + "," + Master;
}